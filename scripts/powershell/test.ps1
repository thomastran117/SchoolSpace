[CmdletBinding()]
param(
  [string]$BackendDir    = "backend",
  [string]$PlaywrightDir = "playwright",
  [switch]$ContinueOnFail
)

$ErrorActionPreference = "Stop"

function Resolve-ScriptDir {
  if ($PSScriptRoot) { return $PSScriptRoot }
  return Split-Path -Parent $MyInvocation.MyCommand.Path
}

function Assert-Command {
  param([string]$Cmd)
  if (-not (Get-Command $Cmd -ErrorAction SilentlyContinue)) {
    throw "Required command not found in PATH: $Cmd"
  }
}

function Invoke-Step {
  param(
    [Parameter(Mandatory = $true)][string]$Key,
    [Parameter(Mandatory = $true)][string]$Title,
    [Parameter(Mandatory = $true)][string]$WorkingDirectory,
    [Parameter(Mandatory = $true)][scriptblock]$Command
  )

  Write-Host ""
  Write-Host $Title
  Write-Host "  > (cwd) $WorkingDirectory"

  Push-Location $WorkingDirectory
  try {
    & $Command
    $exit = $LASTEXITCODE
    if ($null -eq $exit) { $exit = 0 }
  } finally {
    Pop-Location
  }

  return [pscustomobject]@{
    Key      = $Key
    Title    = $Title
    ExitCode = $exit
    Ok       = ($exit -eq 0)
  }
}

$scriptDir = Resolve-ScriptDir
$repoRoot  = (Resolve-Path (Join-Path $scriptDir "..\..")).Path

$backendPath    = Join-Path $repoRoot $BackendDir
$playwrightPath = Join-Path $repoRoot $PlaywrightDir

if (-not (Test-Path $backendPath))    { throw "Backend directory not found: $backendPath" }
if (-not (Test-Path $playwrightPath)) { throw "Playwright directory not found: $playwrightPath" }

Assert-Command "node"
Assert-Command "npm"
Assert-Command "npx"

Write-Host "Repo root       : $repoRoot"
Write-Host "Backend path    : $backendPath"
Write-Host "Playwright path : $playwrightPath"
Write-Host ("Mode            : " + ($(if ($ContinueOnFail) { "continue-on-fail (local)" } else { "fail-fast (CI default)" })))

$results = @()

$r1 = Invoke-Step -Key "backend" `
  -Title "Running backend tests (npm run test)..." `
  -WorkingDirectory $backendPath `
  -Command { npm run test }

$results += $r1

if (-not $r1.Ok -and -not $ContinueOnFail) {
  Write-Host ""
  Write-Host "❌ Backend tests failed. Stopping (fail-fast)."
  exit $r1.ExitCode
}

$r2 = Invoke-Step -Key "playwright" `
  -Title "Running Playwright tests (npx playwright test)..." `
  -WorkingDirectory $playwrightPath `
  -Command { npx playwright test }

$results += $r2

if (-not $r2.Ok -and -not $ContinueOnFail) {
  Write-Host ""
  Write-Host "❌ Playwright tests failed. Stopping (fail-fast)."
  exit $r2.ExitCode
}

Write-Host ""
Write-Host "========== Test Summary =========="

$failed = @()
foreach ($r in $results) {
  $status = if ($r.Ok) { "PASS" } else { "FAIL" }
  Write-Host ("[{0}] {1} (exit {2})" -f $status, $r.Title, $r.ExitCode)
  if (-not $r.Ok) { $failed += $r }
}

if ($failed.Count -gt 0) {
  Write-Host ""
  Write-Host ("❌ {0} step(s) failed." -f $failed.Count)
  exit $failed[0].ExitCode
}

Write-Host ""
Write-Host "✅ All tests passed (backend + Playwright)."
exit 0

[CmdletBinding()]
param(
  [Parameter(Mandatory = $false)]
  [string]$Name,

  [Parameter(Mandatory = $false)]
  [string]$BackendDir = "backend"
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
    [string]$Title,
    [string]$FilePath,
    [string[]]$Args,
    [string]$WorkingDirectory
  )

  Write-Host ""
  Write-Host $Title
  Write-Host ("  > " + $FilePath + " " + ($Args -join " "))
  $p = Start-Process -FilePath $FilePath -ArgumentList $Args -WorkingDirectory $WorkingDirectory -NoNewWindow -PassThru -Wait

  if ($p.ExitCode -ne 0) {
    throw "Step failed (exit code $($p.ExitCode)): $Title"
  }
}

$scriptDir = Resolve-ScriptDir
$repoRoot  = (Resolve-Path (Join-Path $scriptDir "..\..")).Path
$backendPath = Join-Path $repoRoot $BackendDir

if (-not (Test-Path $backendPath)) {
  throw "Backend directory not found: $backendPath"
}

if ([string]::IsNullOrWhiteSpace($Name)) {
  $Name = Read-Host "Migration name (e.g., add_user_table)"
}

$Name = $Name.Trim()
if ([string]::IsNullOrWhiteSpace($Name)) {
  throw "Migration name is required."
}

Assert-Command "node"
Assert-Command "npx"

Write-Host "Repo root   : $repoRoot"
Write-Host "Backend path: $backendPath"
Write-Host "Migration   : $Name"

Invoke-Step -Title "Running Prisma migrate..." `
  -FilePath "npx" `
  -Args @("prisma", "migrate", "dev", "--name", $Name) `
  -WorkingDirectory $backendPath

Invoke-Step -Title "Running Prisma generate..." `
  -FilePath "npx" `
  -Args @("prisma", "generate") `
  -WorkingDirectory $backendPath

Write-Host ""
Write-Host "✅ Migration applied and Prisma client generated successfully."

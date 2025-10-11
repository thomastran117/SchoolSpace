[CmdletBinding()]
param()

try {
  $nodeVersion = & node -v
  $npmVersion  = & npm -v
  Write-Host "Node: $nodeVersion  npm: $npmVersion" -ForegroundColor Green
} catch {
  throw "Node.js (and npm) are not installed or not on PATH."
}

$RootDir      = Resolve-Path (Join-Path $PSScriptRoot "..")
$FrontendPath = Resolve-Path (Join-Path $RootDir "frontend")
$BackendPath  = Resolve-Path (Join-Path $RootDir "backend")

function Assert-Package([string]$Path) {
  if (-not (Test-Path (Join-Path $Path "package.json"))) {
    throw "package.json not found in $Path"
  }
}
Assert-Package $FrontendPath
Assert-Package $BackendPath

Write-Host ("Starting frontend in {0} (quiet)" -f $FrontendPath) -ForegroundColor Cyan
$frontendCmd = 'npm run dev 1>nul 2>nul'
$feProc = Start-Process -FilePath $env:ComSpec `
  -ArgumentList '/c', $frontendCmd `
  -WorkingDirectory $FrontendPath `
  -WindowStyle Hidden `
  -PassThru

$env:FORCE_COLOR  = "1"
$env:DEBUG_COLORS = "1"

Write-Host ("Starting backend in {0}" -f $BackendPath) -ForegroundColor Cyan
Push-Location $BackendPath
try {
  & $env:ComSpec /c "npm run dev"
} finally {
  Pop-Location
  Write-Host "`nStopping frontend..." -ForegroundColor Yellow
  try {
    if ($feProc -and -not $feProc.HasExited) {
      & taskkill /T /PID $feProc.Id /F | Out-Null
    }
  } catch {
    Write-Host "Frontend stop note: $($_.Exception.Message)" -ForegroundColor DarkYellow
  }
  Write-Host "Done." -ForegroundColor Green
}

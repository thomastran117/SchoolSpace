[CmdletBinding()]
param()

try {
  $nodeVersion = & node -v
  $npmVersion  = & npm -v
  Write-Host "Node: $nodeVersion  npm: $npmVersion" -ForegroundColor Green
} catch {
  throw "Node.js (and npm) are not installed or not on PATH."
}

$RootDir      = Resolve-Path (Join-Path $PSScriptRoot "../..")
$FrontendPath = Resolve-Path (Join-Path $RootDir "frontend")
$BackendPath  = Resolve-Path (Join-Path $RootDir "backend")

function Assert-Package([string]$Path) {
  if (-not (Test-Path (Join-Path $Path "package.json"))) {
    throw "package.json not found in $Path"
  }
}
Assert-Package $FrontendPath
Assert-Package $BackendPath

Write-Host ("Starting frontend in {0}" -f $FrontendPath) -ForegroundColor Cyan
$frontendCmd = 'npm run dev'
$feProc = Start-Process -FilePath $env:ComSpec `
  -ArgumentList '/c', $frontendCmd `
  -WorkingDirectory $FrontendPath `
  -WindowStyle Hidden `
  -PassThru

Write-Host ("Starting backend in new window...") -ForegroundColor Cyan
$beProc = Start-Process -FilePath "powershell.exe" `
  -ArgumentList "-NoExit", "-Command", "cd '$BackendPath'; npm run dev" `
  -PassThru


Write-Host "`nAll services running. Press Ctrl+C or close this window to stop everything..." -ForegroundColor Green
try {
  while ($true) { Start-Sleep -Seconds 2 }
} finally {
  Write-Host "`nStopping all services..." -ForegroundColor Yellow
  foreach ($p in @($feProc, $beProc)) {
    try {
      if ($p -and -not $p.HasExited) {
        & taskkill /T /PID $p.Id /F | Out-Null
        Write-Host "Killed PID $($p.Id)" -ForegroundColor DarkYellow
      }
    } catch {
      Write-Host "Note: could not kill PID $($p.Id): $($_.Exception.Message)" -ForegroundColor DarkGray
    }
  }
  Write-Host "All services stopped. Done." -ForegroundColor Green
}

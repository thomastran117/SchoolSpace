Write-Host "=== Setup starting ===" -ForegroundColor Cyan

try {
  $nodeVersion = & node -v
  $npmVersion  = & npm -v
  Write-Host "Node: $nodeVersion  npm: $npmVersion" -ForegroundColor Green
} catch {
  throw "Node.js (and npm) are not installed or not on PATH."
}

$scriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
$ROOT = (Resolve-Path (Join-Path $scriptDir "..\..")).Path
$FRONTEND  = Join-Path $ROOT "frontend"
$BACKEND   = Join-Path $ROOT "backend"
$WORKER   = Join-Path $ROOT "worker"

if (Test-Path (Join-Path $FRONTEND "package.json")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
    Push-Location $FRONTEND
    npm install
    Pop-Location
}

if (Test-Path (Join-Path $BACKEND "package.json")) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Cyan
    Push-Location $BACKEND
    npm install
    Pop-Location
}

if (Test-Path (Join-Path $WORKER "package.json")) {
    Write-Host "Installing worker dependencies..." -ForegroundColor Cyan
    Push-Location $WORKER
    npm install
    Pop-Location
}

Write-Host "=== Setup complete ===" -ForegroundColor Green

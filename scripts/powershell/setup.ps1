Write-Host "=== Setup starting ===" -ForegroundColor Cyan

try {
  $nodeVersion = & node -v
  $npmVersion  = & npm -v
  Write-Host "Node: $nodeVersion  npm: $npmVersion" -ForegroundColor Green
} catch {
  throw "Node.js (and npm) are not installed or not on PATH."
}


$ROOT      = Resolve-Path (Join-Path $PSScriptRoot "../..")
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

if (Test-Path (Join-Path $BACKEND "prisma\schema.prisma")) {
    Push-Location $BACKEND
    Write-Host "Running prisma generate..." -ForegroundColor Cyan
    npx prisma generate

    Write-Host "Applying prisma migrations..." -ForegroundColor Cyan
    if (Test-Path (Join-Path $BACKEND "prisma\migrations")) {
        npx prisma migrate deploy
    } else {
        npx prisma migrate dev --name init
    }
    Pop-Location
}

if (Test-Path (Join-Path $WORKER "prisma\schema.prisma")) {
    Push-Location $WORKER
    Write-Host "Running prisma generate..." -ForegroundColor Cyan
    npx prisma generate

    Write-Host "Applying prisma migrations..." -ForegroundColor Cyan
    if (Test-Path (Join-Path $WORKER "prisma\migrations")) {
        npx prisma migrate deploy
    } else {
        npx prisma migrate dev --name init
    }
    Pop-Location
}


Write-Host "=== Setup complete ===" -ForegroundColor Green

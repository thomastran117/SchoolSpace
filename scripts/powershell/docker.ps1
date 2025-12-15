$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot  = Join-Path $scriptDir "../.."
Set-Location $repoRoot

Write-Host "Building and starting containers (detached)..."
docker compose up -d --build

Write-Host "Switching to attached mode..."
docker compose up

Write-Host ""
Write-Host "All services are now running."
Write-Host "Frontend: http://localhost:3090"
Write-Host "Backend : http://localhost:8090"
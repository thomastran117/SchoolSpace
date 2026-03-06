$ErrorActionPreference = "Stop"

$scriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }

$repoRoot = (Resolve-Path (Join-Path $scriptDir "..\..")).Path

Write-Host "Building and starting containers (detached)..."
docker compose -f (Join-Path $repoRoot "docker-compose.yml") --project-directory $repoRoot up -d --build

Write-Host "Switching to attached mode..."
docker compose -f (Join-Path $repoRoot "docker-compose.yml") --project-directory $repoRoot up

Write-Host ""
Write-Host "All services are now running."
Write-Host "Frontend: http://localhost:3040"
Write-Host "Backend : http://localhost:8040"

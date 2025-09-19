$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot  = Join-Path $scriptDir ".."
Set-Location $repoRoot

function Wait-For-Health($containerName, $timeoutSec = 180) {
    $start = Get-Date
    while ($true) {
        $status = ""
        try { $status = docker inspect -f "{{.State.Health.Status}}" $containerName 2>$null } catch {}
        if ($status -eq "healthy") { return }
        if ((Get-Date) - $start -gt [TimeSpan]::FromSeconds($timeoutSec)) {
            throw "Timeout waiting for $containerName to be healthy."
        }
        Start-Sleep -Seconds 3
    }
}

Write-Host "Building and starting containers (detached)..."
docker compose up -d --build

Write-Host "Waiting for MySQL health..."
Wait-For-Health "schoolspace-mysql" 180

Write-Host "Running Prisma migrations..."
docker compose run --rm backend npx prisma migrate deploy

Write-Host "✅ Migrations applied. Switching to attached mode..."
docker compose up backend frontend redis mysql

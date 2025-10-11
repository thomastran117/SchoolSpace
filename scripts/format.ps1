$root = Get-Location
Set-Location -Path (Split-Path -Parent $MyInvocation.MyCommand.Definition)

Write-Host "Running format script for backend and frontend..." -ForegroundColor Cyan

function Invoke-Format {
    param (
        [string]$path
    )

    Write-Host ""
    Write-Host "Formatting in: $path" -ForegroundColor Yellow

    Push-Location $path
    npm run format
    Pop-Location
}

Invoke-Format "..\backend"
Invoke-Format "..\frontend"

Write-Host ""
Write-Host "All formatting complete." -ForegroundColor Cyan

Set-Location $root

param (
    [switch]$Force
)

$backendPath = Join-Path $PSScriptRoot "..\backend"
$envFilePath = Join-Path $backendPath ".env"

$envContent = @'
DATABASE_URL=""
REDIS_URL=""
JWT_SECRET=""
JWT_SECRET_2=""
CORS_WHITELIST=""

GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GOOGLE_REDIRECT_URI=""

EMAIL_USER=""
EMAIL_PASS=""

MS_TENANT_ID=""
MS_CLIENT_ID=""
MS_CLIENT_SECRET=""
MS_REDIRECT_URI=""

FRONTEND_CLIENT=""
'@

if (-Not (Test-Path $backendPath)) {
    Write-Error "Backend folder not found at $backendPath"
    exit 1
}

Set-Content -Path $envFilePath -Value $envContent -Encoding UTF8

Write-Host ".env file has been created at $envFilePath"

param (
    [switch]$Force
)

$backendPath = Join-Path $PSScriptRoot "..\backend"
$envFilePath = Join-Path $backendPath ".env"

$envContent = @'

##############################################
# Server
##############################################

FRONTEND_CLIENT="http://localhost:3040"
PORT=8040

##############################################
# Databases
##############################################

DATABASE_URL="mysql://root:password123@localhost:3306/database"
REDIS_URL="redis://127.0.0.1:6379"
MONGO_URL="mongodb://localhost:27017/app";

##############################################
# Security / JWT
##############################################

JWT_SECRET_ACCESS="access-jwt-token"
JWT_SECRET_REFRESH="refresh-jwt-token"
JWT_SECRET_VERIFY="verify-jwt-token"

##############################################
# CORS Configuration
##############################################

CORS_WHITELIST=["http://localhost:3040", "http://127.0.0.1:3040", "http://localhost:5173"]

##############################################
# Email (SMTP credentials)
##############################################

EMAIL_USER=""
EMAIL_PASS=""

##############################################
# OAuth
##############################################

GOOGLE_CLIENT_ID=""
MS_TENANT_ID=""
MS_CLIENT_ID=""

'@

if (-Not (Test-Path $backendPath)) {
    Write-Error "Backend folder not found at $backendPath"
    exit 1
}

Set-Content -Path $envFilePath -Value $envContent -Encoding UTF8

Write-Host ".env file has been created at $envFilePath"

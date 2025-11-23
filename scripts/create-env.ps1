param (
    [switch]$Force
)

$backendPath = Join-Path $PSScriptRoot "..\backend"
$frontendPath = Join-Path $PSScriptRoot "..\frontend"
$envFilePathBackend = Join-Path $backendPath ".env"
$envFilePathFrontend = Join-Path $frontendPath ".env"

$envContent_frontend = @'
##############################################
# Server
##############################################

VITE_FRONTEND_URL="http://localhost:3040"
VITE_BACKEND_URL="http://localhost:8040"

##############################################
# OAuth
##############################################

VITE_MSAL_CLIENT_ID="ms_client"
VITE_MSAL_AUTHORITY="https://login.microsoftonline.com/common"
VITE_MSAL_REDIRECT_URI="http://localhost:3040/auth/callback"
VITE_GOOGLE_CLIENT_ID="google_client"

'@

$envContent_backend = @'
##############################################
# Configuration
##############################################

ENVIRONMENT="development"
ZOD_CONFIGURATION="strip"

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
MONGO_URL="mongodb://localhost:27017/app"

##############################################
# Security
##############################################

JWT_SECRET_ACCESS="access-jwt-token"
GOOGLE_CAPTCHA_SECRET="google-captcha"


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

##############################################
# Paypal
##############################################
PAYPAL_CLIENT_ID="paypal-clientid"
PAYPAL_SECRET_KEY="secret-key"
PAYPAL_API="https://api-m.sandbox.paypal.com"
PAYMENT_CURRENCY="CAD"

'@

if (-Not (Test-Path $backendPath)) {
    Write-Error "Backend folder not found at $backendPath"
    exit 1
}

if (-Not (Test-Path $frontendPath)) {
    Write-Error "Frontend folder not found at $frontendPath"
    exit 1
}

Set-Content -Path $envFilePathBackend -Value $envContent_backend -Encoding UTF8

Write-Host ".env file has been created at $envFilePathBackend"

Set-Content -Path $envFilePathFrontend -Value $envContent_frontend -Encoding UTF8

Write-Host ".env file has been created at $envFilePathFrontend"

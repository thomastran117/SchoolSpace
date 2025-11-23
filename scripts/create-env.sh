#!/bin/bash

set -euo pipefail

FORCE=false
if [[ "${1:-}" == "--force" ]]; then
  FORCE=true
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_PATH="$SCRIPT_DIR/../backend"
ENV_FILE_BACK="$BACKEND_PATH/.env"

FRONTEND_PATH="$SCRIPT_DIR/../frontend"
ENV_FILE_FRONT="$FRONTEND_PATH/.env"

ENV_CONTENT_FRONT=$(cat <<'EOF'
##############################################
# Configuration
##############################################

ENVIRONMENT="development"
ZOD_CONFIGURATION="strip"

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

EOF
)

if [[ ! -d "$BACKEND_PATH" ]]; then
  echo "❌ Backend folder not found at $BACKEND_PATH" >&2
  exit 1
fi

if [[ ! -d "$FRONTEND_PATH" ]]; then
  echo "❌ Frontend folder not found at $FRONTEND_PATH" >&2
  exit 1
fi

echo "$ENV_CONTENT_BACK" > "$ENV_FILE_BACK"
echo "✅ .env file has been created at $ENV_FILE_BACK"

echo "$ENV_CONTENT_FRONT" > "$ENV_FILE_FRONT"
echo "✅ .env file has been created at $ENV_FILE_FRONT"

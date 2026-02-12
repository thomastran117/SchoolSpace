#!/usr/bin/env bash
set -euo pipefail

# ----------------------------------------
# Parse arguments
# ----------------------------------------
FORCE=false
if [[ "${1:-}" == "--force" ]]; then
  FORCE=true
fi

# ----------------------------------------
# Resolve paths
# ----------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

BACKEND_PATH="$REPO_ROOT/backend"
WORKER_PATH="$REPO_ROOT/backend"
FRONTEND_PATH="$REPO_ROOT/frontend"

ENV_BACKEND="$BACKEND_PATH/.env"
ENV_FRONTEND="$FRONTEND_PATH/.env"
ENV_WORKER="$WORKER_PATH/.env"

# ----------------------------------------
# Validate directories
# ----------------------------------------
[[ -d "$BACKEND_PATH" ]] || { echo "Backend folder not found at $BACKEND_PATH"; exit 1; }
[[ -d "$FRONTEND_PATH" ]] || { echo "Frontend folder not found at $FRONTEND_PATH"; exit 1; }
[[ -d "$WORKER_PATH" ]] || { echo "Worker folder not found at $WORKER_PATH"; exit 1; }

# ----------------------------------------
# Prevent overwrite unless --force
# ----------------------------------------
write_env() {
  local path="$1"
  local content="$2"

  if [[ -f "$path" && "$FORCE" = false ]]; then
    echo "Skipping $path (already exists). Use --force to overwrite."
    return
  fi

  echo "$content" > "$path"
  echo ".env file has been created at $path"
}

# ----------------------------------------
# Frontend .env
# ----------------------------------------
ENV_CONTENT_FRONTEND='##############################################
# Server
##############################################

VITE_FRONTEND_URL="http://localhost:3040"
VITE_BACKEND_URL="http://localhost:8040"

##############################################
# OAuth
##############################################

VITE_MSAL_CLIENT_ID="ms_client"
VITE_MSAL_AUTHORITY="https://login.microsoftonline.com/common"
VITE_GOOGLE_CLIENT_ID="google_client"

##############################################
# Recaptcha
##############################################
VITE_GOOGLE_RECAPTCHA="captcha"
'

# ----------------------------------------
# Backend .env
# ----------------------------------------
ENV_CONTENT_BACKEND='##############################################
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

DATABASE_URL="mysql://root:password123@localhost:3306/schoolspace"
DATABASE_HOST="localhost"
DATABASE_PORT=3306
DATABASE_PASSWORD="password123"
DATABASE_NAME="schoolspace"
DATABASE_USER="root"
REDIS_URL="redis://127.0.0.1:6379"
RABBITMQ_URL="amqp://guest:guest@localhost:5672"

##############################################
# Security
##############################################

JWT_SECRET_ACCESS="access-jwt-token"
GOOGLE_CAPTCHA_SECRET="google-captcha"

##############################################
# CORS Configuration
##############################################

CORS_WHITELIST=["http://localhost:3040","http://127.0.0.1:3040","http://localhost:5173"]

##############################################
# Email
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
'

# ----------------------------------------
# Worker .env
# ----------------------------------------
ENV_CONTENT_WORKER='##############################################
# Configuration
##############################################

ENVIRONMENT="development"

##############################################
# Server
##############################################

FRONTEND_CLIENT="http://localhost:3040"

##############################################
# Databases
##############################################

REDIS_URL="redis://127.0.0.1:6379"
RABBITMQ_URL="amqp://guest:guest@localhost:5672"

##############################################
# Email
##############################################

EMAIL_USER=""
EMAIL_PASS=""

##############################################
# Paypal
##############################################

PAYPAL_CLIENT_ID="paypal-clientid"
PAYPAL_SECRET_KEY="secret-key"
PAYPAL_API="https://api-m.sandbox.paypal.com"
PAYMENT_CURRENCY="CAD"
'

# ----------------------------------------
# Write files
# ----------------------------------------
write_env "$ENV_BACKEND" "$ENV_CONTENT_BACKEND"
write_env "$ENV_FRONTEND" "$ENV_CONTENT_FRONTEND"
write_env "$ENV_WORKER" "$ENV_CONTENT_WORKER"

echo
echo "Environment setup complete."

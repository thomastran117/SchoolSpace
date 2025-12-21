#!/usr/bin/env bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

BACKEND_PATH="$(cd "$SCRIPT_DIR/../../backend" && pwd 2>/dev/null || true)"
WORKER_PATH="$BACKEND_PATH"
FRONTEND_PATH="$(cd "$SCRIPT_DIR/../../frontend" && pwd 2>/dev/null || true)"

ENV_BACKEND="$BACKEND_PATH/.env"
ENV_FRONTEND="$FRONTEND_PATH/.env"
ENV_WORKER="$WORKER_PATH/.env"

if [[ ! -d "$BACKEND_PATH" ]]; then
  echo "Backend folder not found at $BACKEND_PATH" >&2
  exit 1
fi

if [[ ! -d "$FRONTEND_PATH" ]]; then
  echo "Frontend folder not found at $FRONTEND_PATH" >&2
  exit 1
fi

if [[ ! -d "$WORKER_PATH" ]]; then
  echo "Worker folder not found at $WORKER_PATH" >&2
  exit 1
fi

cat > "$ENV_FRONTEND" <<'EOF'
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
VITE_GOOGLE_CLIENT_ID="google_client"

##############################################
# Recaptcha
##############################################
VITE_GOOGLE_RECAPTCHA="captcha"
EOF

echo ".env file has been created at $ENV_FRONTEND"

cat > "$ENV_BACKEND" <<'EOF'
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

REDIS_URL="redis://127.0.0.1:6379"
MONGO_URL="mongodb://localhost:27017/app"
RABBITMQ_URL="amqp://guest:guest@localhost:5672"

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

echo ".env file has been created at $ENV_BACKEND"

cat > "$ENV_WORKER" <<'EOF'
##############################################
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
MONGO_URL="mongodb://localhost:27017/app"
RABBITMQ_URL="amqp://guest:guest@localhost:5672"

##############################################
# Email (SMTP credentials)
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
EOF

echo ".env file has been created at $ENV_WORKER"

#!/bin/bash

set -euo pipefail

FORCE=false
if [[ "${1:-}" == "--force" ]]; then
  FORCE=true
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_PATH="$SCRIPT_DIR/../backend"
ENV_FILE="$BACKEND_PATH/.env"

ENV_CONTENT=$(cat <<'EOF'
##############################################
# Server
##############################################

FRONTEND_CLIENT="http://localhost:3040"
PORT=8040

##############################################
# Database & Redis
##############################################

DATABASE_URL="mysql://root:password123@localhost:3306/database"
REDIS_URL="redis://127.0.0.1:6379"

##############################################
# Security / JWT
##############################################

JWT_SECRET="schoolspace-secret"
JWT_SECRET_2="schoolspace-top-secret"

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
# Google OAuth2
##############################################

GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GOOGLE_REDIRECT_URI=""

##############################################
# Microsoft OAuth2
##############################################

MS_TENANT_ID=""
MS_CLIENT_ID=""
MS_CLIENT_SECRET=""
MS_REDIRECT_URI=""
EOF
)

if [[ ! -d "$BACKEND_PATH" ]]; then
  echo "❌ Backend folder not found at $BACKEND_PATH" >&2
  exit 1
fi

echo "$ENV_CONTENT" > "$ENV_FILE"

echo "✅ .env file has been created at $ENV_FILE"

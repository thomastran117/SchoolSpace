set -euo pipefail

FORCE=false
if [[ "${1:-}" == "--force" ]]; then
  FORCE=true
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_PATH="$SCRIPT_DIR/../backend"
ENV_FILE="$BACKEND_PATH/.env"

read -r -d '' ENV_CONTENT <<'EOF'
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
EOF

if [[ ! -d "$BACKEND_PATH" ]]; then
  echo "❌ Backend folder not found at $BACKEND_PATH" >&2
  exit 1
fi

echo "$ENV_CONTENT" > "$ENV_FILE"

echo "✅ .env file has been created at $ENV_FILE"

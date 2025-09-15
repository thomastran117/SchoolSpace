set -euo pipefail

echo "=== Setup starting ==="

if ! command -v node >/dev/null 2>&1; then
  echo "Error: Node.js is not installed or not in PATH." >&2
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "Error: npm is not installed or not in PATH." >&2
  exit 1
fi

echo "Node: $(node -v)  npm: $(npm -v)"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
FRONTEND="${ROOT}/frontend"
BACKEND="${ROOT}/backend"

if [ -f "${FRONTEND}/package.json" ]; then
  echo "Installing frontend dependencies..."
  (cd "${FRONTEND}" && npm install)
fi

if [ -f "${BACKEND}/package.json" ]; then
  echo "Installing backend dependencies..."
  (cd "${BACKEND}" && npm install)
fi

if [ -f "${BACKEND}/prisma/schema.prisma" ]; then
  echo "Running prisma generate..."
  (cd "${BACKEND}" && npx prisma generate)

  echo "Applying prisma migrations..."
  if [ -d "${BACKEND}/prisma/migrations" ] && [ "$(ls -A "${BACKEND}/prisma/migrations")" ]; then
    (cd "${BACKEND}" && npx prisma migrate deploy)
  else
    (cd "${BACKEND}" && npx prisma migrate dev --name init)
  fi
fi

echo "=== Setup complete ==="

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "$REPO_ROOT"

wait_for_health() {
  local container="$1"
  local timeout="${2:-180}"
  local start=$(date +%s)

  while true; do
    local status
    status=$(docker inspect -f "{{.State.Health.Status}}" "$container" 2>/dev/null || echo "")

    if [[ "$status" == "healthy" ]]; then
      return 0
    fi

    local now=$(date +%s)
    if (( now - start > timeout )); then
      echo "Timeout waiting for $container to be healthy." >&2
      exit 1
    fi

    sleep 3
  done
}

echo "Building and starting containers (detached)..."
docker compose up -d --build

echo "Waiting for MySQL health..."
wait_for_health "app-mysql" 180

echo "Running Prisma migrations..."
docker compose run --rm backend npx prisma migrate deploy

echo "✅ Migrations applied. Switching to attached mode..."
docker compose up backend frontend redis mysql

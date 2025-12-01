#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "$REPO_ROOT"

wait_for_health() {
  local container="$1"
  local timeout="${2:-180}"
  local start
  start=$(date +%s)

  echo "⏳ Waiting for $container to become healthy..."

  while true; do
    local status
    status=$(docker inspect -f "{{.State.Health.Status}}" "$container" 2>/dev/null || echo "")

    if [[ "$status" == "healthy" ]]; then
      echo "✅ $container is healthy!"
      return 0
    fi

    local now
    now=$(date +%s)
    if (( now - start > timeout )); then
      echo "❌ Timeout waiting for $container to be healthy." >&2
      exit 1
    fi

    sleep 3
  done
}

MODE="${1:-local}"

echo "🚀 Building and starting containers (detached)..."
docker compose up -d --build

wait_for_health "schoolspace-mysql" 180
wait_for_health "schoolspace-redis" 120
wait_for_health "schoolspace-mongodb" 180


if [[ "$MODE" == "ci" ]]; then
  echo "(CI mode). Containers remain detached."
else
  echo "Attaching to backend, frontend, redis, and mysql logs..."
  docker compose up backend frontend redis mysql
fi

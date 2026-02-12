#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "Building and starting containers (detached)..."
docker compose \
  -f "$REPO_ROOT/docker-compose.yml" \
  --project-directory "$REPO_ROOT" \
  up -d --build

echo "Switching to attached mode..."
docker compose \
  -f "$REPO_ROOT/docker-compose.yml" \
  --project-directory "$REPO_ROOT" \
  up

echo
echo "All services are now running."
echo "Frontend: http://localhost:3040"
echo "Backend : http://localhost:8040"

#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "Building and starting containers (detached)..."
docker compose \
  -f "$REPO_ROOT/docker-compose.yml" \
  --project-directory "$REPO_ROOT" \
  up -d --build

echo "Containers are running in detached mode."
docker compose \
  -f "$REPO_ROOT/docker-compose.yml" \
  --project-directory "$REPO_ROOT" \
  ps

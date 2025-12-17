#!/usr/bin/env bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$REPO_ROOT"

echo "Building and starting containers (detached)..."
docker compose up -d --build

echo "Switching to attached mode..."
docker compose up

echo ""
echo "All services are now running."
echo "Frontend: http://localhost:3090"
echo "Backend : http://localhost:8090"

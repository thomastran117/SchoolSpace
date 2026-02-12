#!/usr/bin/env bash
set -euo pipefail

info()    { printf "\033[36m%s\033[0m\n" "$*"; }
success() { printf "\033[32m%s\033[0m\n" "$*"; }
warn()    { printf "\033[33m%s\033[0m\n" "$*"; }
fail()    { printf "\033[31m%s\033[0m\n" "$*"; exit 1; }

if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  fail "Node.js (and npm) are not installed or not on PATH."
fi

NODE_VERSION="$(node -v)"
NPM_VERSION="$(npm -v)"
success "Node: $NODE_VERSION  npm: $NPM_VERSION"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

FRONTEND_PATH="$ROOT_DIR/frontend"
BACKEND_PATH="$ROOT_DIR/backend"
WORKER_PATH="$ROOT_DIR/worker"

assert_package() {
  local p="$1"
  [[ -f "$p/package.json" ]] || fail "package.json not found in $p"
}

assert_package "$FRONTEND_PATH"
assert_package "$BACKEND_PATH"
assert_package "$WORKER_PATH"

PIDS=()

start_bg() {
  local name="$1"
  shift

  info "Starting $name..."
  (
    exec "$@"
  ) &
  local pid=$!
  PIDS+=("$pid")
  success "$name started (PID $pid)"
}

cleanup() {
  echo
  warn "Stopping all services..."

  for pid in "${PIDS[@]:-}"; do
    if kill -0 "$pid" 2>/dev/null; then
      kill -TERM "-$pid" 2>/dev/null || kill -TERM "$pid" 2>/dev/null || true
    fi
  done

  sleep 1 || true
  for pid in "${PIDS[@]:-}"; do
    if kill -0 "$pid" 2>/dev/null; then
      kill -KILL "-$pid" 2>/dev/null || kill -KILL "$pid" 2>/dev/null || true
    fi
  done

  success "All services stopped. Done."
}

trap cleanup INT TERM EXIT

info "Starting frontend in $FRONTEND_PATH"
start_bg "frontend" bash -lc "cd '$FRONTEND_PATH' && npm run dev"

start_bg "backend" bash -lc "cd '$BACKEND_PATH' && npm run dev"

start_bg "email worker" bash -lc "cd '$WORKER_PATH' && npx tsx src/workers/emailWorker.ts"

echo
success "All services running. Press Ctrl+C to stop everything..."
while true; do sleep 2; done

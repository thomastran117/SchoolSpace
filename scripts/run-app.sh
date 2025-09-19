#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
FRONTEND_PATH="${ROOT_DIR}/frontend"
BACKEND_PATH="${ROOT_DIR}/backend"

if ! command -v node >/dev/null 2>&1; then
  echo "Error: Node.js is not installed or not on PATH." >&2
  exit 1
fi
if ! command -v npm >/dev/null 2>&1; then
  echo "Error: npm is not installed or not on PATH." >&2
  exit 1
fi
echo "Node: $(node -v)  npm: $(npm -v)"

[[ -f "${FRONTEND_PATH}/package.json" ]] || { echo "Missing ${FRONTEND_PATH}/package.json" >&2; exit 1; }
[[ -f "${BACKEND_PATH}/package.json"  ]] || { echo "Missing ${BACKEND_PATH}/package.json"  >&2; exit 1; }

echo "Starting frontend in ${FRONTEND_PATH} (quiet)"
setsid bash -lc "cd '${FRONTEND_PATH}' && npm run dev" >/dev/null 2>&1 &
FRONTEND_PID=$!
FRONTEND_PGID="$(ps -o pgid= "${FRONTEND_PID}" | tr -d ' ')"

cleanup() {
  echo
  echo "Stopping frontend..." 
  if [[ -n "${FRONTEND_PGID:-}" ]]; then
    kill -TERM -"${FRONTEND_PGID}" 2>/dev/null || true
    sleep 1
    kill -KILL -"${FRONTEND_PGID}" 2>/dev/null || true
  fi
  echo "Done."
}
trap cleanup EXIT INT TERM

export FORCE_COLOR=1
export DEBUG_COLORS=1
echo "Starting backend in ${BACKEND_PATH}"
cd "${BACKEND_PATH}"
npm run dev

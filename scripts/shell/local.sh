#!/usr/bin/env bash

# ---------------------------------------------
# Fail fast
# ---------------------------------------------
set -e

# ---------------------------------------------
# Colors
# ---------------------------------------------
GREEN="\033[32m"
CYAN="\033[36m"
YELLOW="\033[33m"
DARKYELLOW="\033[33m"
GRAY="\033[90m"
RESET="\033[0m"

if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  echo "Node.js (and npm) are not installed or not on PATH." >&2
  exit 1
fi

NODE_VERSION="$(node -v)"
NPM_VERSION="$(npm -v)"
echo -e "${GREEN}Node: $NODE_VERSION  npm: $NPM_VERSION${RESET}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

FRONTEND_PATH="$ROOT_DIR/frontend"
BACKEND_PATH="$ROOT_DIR/backend"
WORKER_PATH="$ROOT_DIR/worker"

assert_package() {
  if [[ ! -f "$1/package.json" ]]; then
    echo "package.json not found in $1" >&2
    exit 1
  fi
}

assert_package "$FRONTEND_PATH"
assert_package "$BACKEND_PATH"
assert_package "$WORKER_PATH"

echo -e "${CYAN}Starting frontend in $FRONTEND_PATH${RESET}"
(
  cd "$FRONTEND_PATH"
  npm run dev
) &
FE_PID=$!

echo -e "${CYAN}Starting backend...${RESET}"
(
  cd "$BACKEND_PATH"
  npm run dev
) &
BE_PID=$!

echo -e "${CYAN}Starting workers...${RESET}"
(
  cd "$WORKER_PATH"
  npx tsx src/workers/emailWorker.ts
) &
WK_PID=$!

cleanup() {
  echo -e "\n${YELLOW}Stopping all services...${RESET}"

  for PID in $FE_PID $BE_PID $WK_PID; do
    if kill -0 "$PID" 2>/dev/null; then
      kill "$PID" 2>/dev/null || true
      echo -e "${DARKYELLOW}Killed PID $PID${RESET}"
    else
      echo -e "${GRAY}Note: could not kill PID $PID${RESET}"
    fi
  done

  echo -e "${GREEN}All services stopped. Done.${RESET}"
}

trap cleanup INT TERM EXIT

echo -e "\n${GREEN}All services running. Press Ctrl+C to stop everything...${RESET}"
while true; do
  sleep 2
done

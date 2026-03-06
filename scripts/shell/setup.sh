#!/usr/bin/env bash

set -e

CYAN="\033[36m"
GREEN="\033[32m"
RESET="\033[0m"

echo -e "${CYAN}=== Setup starting ===${RESET}"

if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  echo "Node.js (and npm) are not installed or not on PATH." >&2
  exit 1
fi

NODE_VERSION="$(node -v)"
NPM_VERSION="$(npm -v)"

echo -e "${GREEN}Node: $NODE_VERSION  npm: $NPM_VERSION${RESET}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

FRONTEND="$ROOT/frontend"
BACKEND="$ROOT/backend"

install_deps() {
  local name="$1"
  local path="$2"

  if [[ -f "$path/package.json" ]]; then
    echo -e "${CYAN}Installing $name dependencies...${RESET}"
    pushd "$path" > /dev/null
    npm install
    popd > /dev/null
  fi
}

install_deps "frontend" "$FRONTEND"
install_deps "backend"  "$BACKEND"
install_deps "worker"   "$WORKER"

echo -e "${GREEN}=== Setup complete ===${RESET}"

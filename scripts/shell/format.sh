#!/usr/bin/env bash

set -e

ROOT_DIR="$(pwd)"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

CYAN="\033[36m"
YELLOW="\033[33m"
RESET="\033[0m"

echo -e "${CYAN}Running format script...${RESET}"

invoke_format() {
  local path="$1"

  echo ""
  echo -e "${YELLOW}Formatting in: $path${RESET}"

  pushd "$path" > /dev/null
  npm run format
  popd > /dev/null
}

invoke_format "../../backend"
invoke_format "../../frontend"
invoke_format "../../worker"

echo ""
echo -e "${CYAN}All formatting complete.${RESET}"

cd "$ROOT_DIR"

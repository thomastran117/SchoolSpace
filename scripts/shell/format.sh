#!/usr/bin/env bash
set -e 

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo -e "\033[0;36mRunning format script for backend and frontend...\033[0m"

run_format() {
  local dir="$1"
  echo ""
  echo -e "\033[1;33mFormatting in: $dir\033[0m"

  pushd "$dir" > /dev/null
  if npm run format; then
    echo -e "\033[0;32m✔ Formatting completed in $dir\033[0m"
  else
    echo -e "\033[0;31m✖ Failed to format in $dir\033[0m"
  fi
  popd > /dev/null
}

run_format "$ROOT_DIR/backend"
run_format "$ROOT_DIR/frontend"

echo ""
echo -e "\033[0;36mAll formatting complete.\033[0m"

cd "$ROOT_DIR"

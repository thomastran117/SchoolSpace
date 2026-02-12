#!/usr/bin/env bash
set -euo pipefail

COMMAND="${1:---help}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$SCRIPT_DIR"
SCRIPTS_DIR="$REPO_ROOT/scripts/shell"

header() {
  echo
  printf "\033[36m%s\033[0m\n" "$1"
}

cmd_row() {
  local name="$1"
  local desc="$2"
  printf "%-12s %s\n" "$name" "$desc"
}

fail() {
  printf "\n\033[31m%s\033[0m\n" "$1" >&2
  exit 1
}

invoke_script() {
  local script_name="$1"
  local path="$SCRIPTS_DIR/$script_name"

  if [[ ! -f "$path" ]]; then
    printf "\n\033[31mScript not found: %s\033[0m\n" "$script_name" >&2
    printf "\033[90mExpected location: %s\033[0m\n\n" "$path" >&2
    exit 1
  fi

  chmod +x "$path" 2>/dev/null || true

  "$path"
}

show_help() {
  header "Usage"
  printf "  \033[33m./app.sh <command>\033[0m\n"

  header "Description"
  echo "  Main entry point for managing and running project tasks."

  header "Commands"
  cmd_row "docker"  "Start Docker Compose services"
  cmd_row "k8"      "Start Kubernetes services"
  cmd_row "local"   "Run the application locally"
  cmd_row "env"     "Generate a new .env file"
  cmd_row "setup"   "Install local dependencies"
  cmd_row "format"  "Run code formatting scripts"
  cmd_row "port"    "Frees port 3040 and 8040"
  cmd_row "migrate" "Runs prisma database migration"
  cmd_row "test"    "Runs all test"
  cmd_row "--help"  "Show this help message"

  header "Examples"
  printf "  \033[33m./app.sh docker\033[0m\n"
  echo "  ./app.sh local"
  echo "  ./app.sh env"
  echo "  ./app.sh setup"
  echo
}

COMMAND_LC="$(printf "%s" "$COMMAND" | tr '[:upper:]' '[:lower:]')"

case "$COMMAND_LC" in
  docker)   invoke_script "docker.sh" ;;
  k8)       invoke_script "k8.sh" ;;
  local)    invoke_script "local.sh" ;;
  env)      invoke_script "env.sh" ;;
  setup)    invoke_script "setup.sh" ;;
  format)   invoke_script "format.sh" ;;
  port)     invoke_script "clear-port.sh" ;;
  migrate)  invoke_script "migrate.sh" ;;
  test)     invoke_script "test.sh" ;;
  --help|-h|help) show_help ;;
  *)
    printf "\n\033[31mUnknown command: %s\033[0m\n\n" "$COMMAND" >&2
    show_help
    exit 1
    ;;
esac

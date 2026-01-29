#!/usr/bin/env bash

COMMAND="${1:---help}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPTS_DIR="$SCRIPT_DIR/scripts/shell"

write_header() {
  echo ""
  echo -e "\033[36m$1\033[0m"
}

write_command() {
  local name="$1"
  local desc="$2"
  printf "%-12s %s\n" "$name" "$desc"
}

invoke_script() {
  local script_name="$1"
  local path="$SCRIPTS_DIR/$script_name"

  if [[ ! -f "$path" ]]; then
    echo -e "\n\033[31mScript not found: $script_name\033[0m\n"
    exit 1
  fi

  bash "$path"
}

show_help() {
  write_header "Usage"
  echo -e "  ./app.sh <command>"

  write_header "Description"
  echo "  Main entry point for managing and running project tasks."

  write_header "Commands"
  write_command "docker"  "Start Docker Compose services"
  write_command "k8"      "Start Kubernetes services"
  write_command "local"   "Run the application locally"
  write_command "env"     "Generate a new .env file"
  write_command "setup"   "Install local dependencies"
  write_command "format"  "Run code formatting scripts"
  write_command "--help"  "Show this help message"

  write_header "Examples"
  echo -e "  ./app.sh docker"
  echo -e "  ./app.sh local"
  echo -e "  ./app.sh env"
  echo -e "  ./app.sh setup"
  echo ""
}

case "${COMMAND,,}" in
  docker)
    invoke_script "docker.sh"
    ;;
  k8)
    invoke_script "k8.sh"
    ;;
  local)
    invoke_script "local.sh"
    ;;
  env)
    invoke_script "env.sh"
    ;;
  setup)
    invoke_script "setup.sh"
    ;;
  format)
    invoke_script "format.sh"
    ;;
  --help)
    show_help
    ;;
  *)
    echo -e "\n\033[31mUnknown command: $COMMAND\033[0m\n"
    show_help
    exit 1
    ;;
esac

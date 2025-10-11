#!/usr/bin/env bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

show_help() {
  echo ""
  echo -e "\033[36mUsage:\033[0m"
  echo -e "  ./app.sh <command> [options]\n"
  
  echo -e "\033[36mDescription:\033[0m"
  echo "  Main entry point for managing and running project tasks."
  echo ""
  
  echo -e "\033[36mCommands:\033[0m"
  printf "  %-10s %s\n" "docker" "Run docker.sh   → Starts Docker Compose services"
  printf "  %-10s %s\n" "app"    "Run app.sh      → Launches the app locally"
  printf "  %-10s %s\n" "env"    "Run create-env.sh   → Generates a new .env file"
  printf "  %-10s %s\n" "setup"  "Run setup.sh        → Installs local dependencies"
  printf "  %-10s %s\n" "format"  "Run format.sh        → Formats repo"
  printf "  %-10s %s\n" "--help" "Show this help message"
  echo ""
  
  echo -e "\033[36mExamples:\033[0m"
  echo -e "  ./app.sh docker"
  echo -e "  ./app.sh app"
  echo -e "  ./app.sh env"
  echo -e "  ./app.sh setup"
  echo ""
}

COMMAND="$1"
shift || true

case "$COMMAND" in
  docker)
    bash "$SCRIPT_DIR/scripts/docker.sh" "$@"
    ;;
  app)
    bash "$SCRIPT_DIR/scripts/app.sh" "$@"
    ;;
  env)
    bash "$SCRIPT_DIR/scripts/create-env.sh" "$@"
    ;;
  fprmat)
    bash "$SCRIPT_DIR/scripts/format.sh" "$@"
    ;;
  setup)
    bash "$SCRIPT_DIR/scripts/setup.sh" "$@"
    ;;
  --help|"")
    show_help
    ;;
  *)
    echo -e "\n\033[31mUnknown or missing command: $COMMAND\033[0m\n"
    show_help
    exit 1
    ;;
esac

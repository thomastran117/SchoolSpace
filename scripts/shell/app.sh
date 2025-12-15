#!/usr/bin/env bash
set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="$( realpath "$SCRIPT_DIR/.." )"
FRONTEND_PATH="$ROOT_DIR/frontend"
BACKEND_PATH="$ROOT_DIR/backend"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is not installed or not in PATH."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is not installed or not in PATH."
  exit 1
fi

echo "✅ Node: $(node -v)  npm: $(npm -v)"

for path in "$FRONTEND_PATH" "$BACKEND_PATH"; do
  if [[ ! -f "$path/package.json" ]]; then
    echo "package.json not found in $path"
    exit 1
  fi
done

echo "Starting frontend in $FRONTEND_PATH"
(
  cd "$FRONTEND_PATH"
  npm run dev >/dev/null 2>&1 &
  FE_PID=$!
)

echo "Starting backend in $BACKEND_PATH"
if command -v gnome-terminal >/dev/null 2>&1; then
  gnome-terminal -- bash -c "cd '$BACKEND_PATH'; npm run dev; exec bash" &
  BE_PID=$!
elif command -v open >/dev/null 2>&1; then
  osascript -e "tell app \"Terminal\" to do script \"cd '$BACKEND_PATH'; npm run dev\"" &
else
  (cd "$BACKEND_PATH" && npm run dev) &
  BE_PID=$!
fi

echo "Starting payment worker..."
if command -v gnome-terminal >/dev/null 2>&1; then
  gnome-terminal -- bash -c "cd '$BACKEND_PATH'; npx ts-node ./src/workers/paymentWorker.ts; exec bash" &
  WK_PID=$!
elif command -v open >/dev/null 2>&1; then
  osascript -e "tell app \"Terminal\" to do script \"cd '$BACKEND_PATH'; npx ts-node ./src/workers/paymentWorker.ts\"" &
else
  (cd "$BACKEND_PATH" && npx ts-node ./src/workers/paymentWorker.ts) &
  WK_PID=$!
fi

cleanup() {
  echo ""
  echo "Stopping all services..."
  [[ -n "$FE_PID" ]] && kill "$FE_PID" 2>/dev/null && echo "Frontend stopped."
  [[ -n "$BE_PID" ]] && kill "$BE_PID" 2>/dev/null && echo "Backend stopped."
  [[ -n "$WK_PID" ]] && kill "$WK_PID" 2>/dev/null && echo "Worker stopped."
  echo "Done."
  exit 0
}

trap cleanup SIGINT SIGTERM

echo ""
echo "✅ All services running. Press Ctrl+C to stop..."
while true; do sleep 2; done

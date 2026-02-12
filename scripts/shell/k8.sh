#!/usr/bin/env bash
set -euo pipefail

NAMESPACE="schoolspace"
FRONTEND_PORT=3040
BACKEND_PORT=8040

info()    { printf "\033[36m[K8S ]\033[0m %s\n" "$*"; }
success() { printf "\033[32m[ OK ]\033[0m %s\n" "$*"; }
warn()    { printf "\033[33m[WARN]\033[0m %s\n" "$*"; }
fail()    { printf "\033[31m[ERR ]\033[0m %s\n" "$*"; exit 1; }

while [[ $# -gt 0 ]]; do
  case "$1" in
    -n|--namespace)      NAMESPACE="$2"; shift 2;;
    --frontend-port)     FRONTEND_PORT="$2"; shift 2;;
    --backend-port)      BACKEND_PORT="$2"; shift 2;;
    -h|--help)
      cat <<EOF
Usage: $(basename "$0") [options]

Options:
  -n, --namespace NAME       Kubernetes namespace (default: schoolspace)
      --frontend-port PORT   Local port for frontend svc (default: 3040)
      --backend-port PORT    Local port for backend svc (default: 8040)

Example:
  $(basename "$0") -n schoolspace --frontend-port 3040 --backend-port 8040
EOF
      exit 0
      ;;
    *)
      fail "Unknown argument: $1"
      ;;
  esac
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

FRONTEND_PATH="$ROOT/frontend"
BACKEND_PATH="$ROOT/backend"
WORKER_PATH="$ROOT/worker"
MANIFEST="$ROOT/schoolspace.yml"

info "Checking dependencies..."
for cmd in docker kubectl; do
  command -v "$cmd" >/dev/null 2>&1 || fail "$cmd not found on PATH"
done
success "All dependencies found"

[[ -d "$FRONTEND_PATH" ]] || fail "Frontend folder not found at $FRONTEND_PATH"
[[ -d "$BACKEND_PATH"  ]] || fail "Backend folder not found at $BACKEND_PATH"
[[ -d "$WORKER_PATH"   ]] || fail "Worker folder not found at $WORKER_PATH"
[[ -f "$MANIFEST"      ]] || fail "Manifest not found at $MANIFEST"

info "Building Docker images..."
docker build -t school-frontend:latest "$FRONTEND_PATH" >/dev/null
docker build -t school-backend:latest  "$BACKEND_PATH"  >/dev/null
docker build -t school-worker:latest   "$WORKER_PATH"   >/dev/null
success "Docker images built"

info "Applying Kubernetes manifests..."
kubectl apply -f "$MANIFEST" >/dev/null
success "Manifests applied"

info "Waiting for deployments..."
kubectl rollout status deployment/frontend -n "$NAMESPACE" --timeout=120s >/dev/null
kubectl rollout status deployment/backend  -n "$NAMESPACE" --timeout=120s >/dev/null
kubectl rollout status deployment/worker   -n "$NAMESPACE" --timeout=120s >/dev/null
success "All deployments ready"

info "Current pod status:"
kubectl get pods -n "$NAMESPACE"

warn "Starting port-forwards (Ctrl+C to stop)"

PF_FRONTEND_LOG="${TMPDIR:-/tmp}/schoolspace-pf-frontend.log"
PF_BACKEND_LOG="${TMPDIR:-/tmp}/schoolspace-pf-backend.log"

kubectl port-forward -n "$NAMESPACE" svc/frontend "${FRONTEND_PORT}:3040" >"$PF_FRONTEND_LOG" 2>&1 &
PF_FRONTEND_PID=$!

kubectl port-forward -n "$NAMESPACE" svc/backend  "${BACKEND_PORT}:8090"  >"$PF_BACKEND_LOG"  2>&1 &
PF_BACKEND_PID=$!

cleanup() {
  warn "Stopping port-forwards..."
  kill "$PF_FRONTEND_PID" "$PF_BACKEND_PID" 2>/dev/null || true
}
trap cleanup INT TERM EXIT

echo
success "Dev environment is ready"
echo "  Frontend: http://localhost:${FRONTEND_PORT}"
echo "  Backend : http://localhost:${BACKEND_PORT}"

echo
warn "Cleanup later:"
echo "  kubectl delete namespace ${NAMESPACE}"

wait

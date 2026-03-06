#!/usr/bin/env bash
set -euo pipefail

BACKEND_DIR="backend"
PLAYWRIGHT_DIR="playwright"
CONTINUE_ON_FAIL=false

fail() { echo "[ERR ] $*" >&2; exit 1; }

assert_command() {
  command -v "$1" >/dev/null 2>&1 || fail "Required command not found in PATH: $1"
}

resolve_script_dir() {
  cd "$(dirname "${BASH_SOURCE[0]}")" && pwd
}

RESULTS=()

invoke_step() {
  local key="$1"
  local title="$2"
  local wd="$3"
  local cmd="$4"

  echo
  echo "$title"
  echo "  > (cwd) $wd"

  local exitcode=0

  (
    cd "$wd"
    set +e
    bash -lc "$cmd"
    exitcode=$?
    exit "$exitcode"
  )
  exitcode=$?

  local ok="false"
  if [[ "$exitcode" -eq 0 ]]; then ok="true"; fi

  RESULTS+=("${key}|${title}|${exitcode}|${ok}")
  return "$exitcode"
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --backend-dir)      BACKEND_DIR="$2"; shift 2;;
    --playwright-dir)   PLAYWRIGHT_DIR="$2"; shift 2;;
    --continue-on-fail) CONTINUE_ON_FAIL=true; shift 1;;
    -h|--help)
      cat <<EOF
Usage: $(basename "$0") [options]

Options:
  --backend-dir DIR        Backend directory (default: backend)
  --playwright-dir DIR     Playwright directory (default: playwright)
  --continue-on-fail       Run all steps even if one fails (local mode)
  -h, --help               Show help

Examples:
  $(basename "$0")
  $(basename "$0") --continue-on-fail
  $(basename "$0") --backend-dir backend --playwright-dir playwright
EOF
      exit 0
      ;;
    *) fail "Unknown argument: $1" ;;
  esac
done

SCRIPT_DIR="$(resolve_script_dir)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

BACKEND_PATH="$REPO_ROOT/$BACKEND_DIR"
PLAYWRIGHT_PATH="$REPO_ROOT/$PLAYWRIGHT_DIR"

[[ -d "$BACKEND_PATH" ]] || fail "Backend directory not found: $BACKEND_PATH"
[[ -d "$PLAYWRIGHT_PATH" ]] || fail "Playwright directory not found: $PLAYWRIGHT_PATH"

assert_command node
assert_command npm
assert_command npx

echo "Repo root       : $REPO_ROOT"
echo "Backend path    : $BACKEND_PATH"
echo "Playwright path : $PLAYWRIGHT_PATH"
if $CONTINUE_ON_FAIL; then
  echo "Mode            : continue-on-fail (local)"
else
  echo "Mode            : fail-fast (CI default)"
fi

invoke_step "backend" \
  "Running backend tests (npm run test)..." \
  "$BACKEND_PATH" \
  "npm run test"
R1=$?

if [[ "$R1" -ne 0 && "$CONTINUE_ON_FAIL" = false ]]; then
  echo
  echo "❌ Backend tests failed. Stopping (fail-fast)."
  exit "$R1"
fi

invoke_step "playwright" \
  "Running Playwright tests (npx playwright test)..." \
  "$PLAYWRIGHT_PATH" \
  "npx playwright test"
R2=$?

if [[ "$R2" -ne 0 && "$CONTINUE_ON_FAIL" = false ]]; then
  echo
  echo "❌ Playwright tests failed. Stopping (fail-fast)."
  exit "$R2"
fi

echo
echo "========== Test Summary =========="

FAILED_EXIT=0
FAILED_COUNT=0

for row in "${RESULTS[@]}"; do
  IFS='|' read -r key title exitcode ok <<< "$row"
  if [[ "$ok" == "true" ]]; then
    echo "[PASS] $title (exit $exitcode)"
  else
    echo "[FAIL] $title (exit $exitcode)"
    ((FAILED_COUNT+=1))
    if [[ "$FAILED_EXIT" -eq 0 ]]; then
      FAILED_EXIT="$exitcode"
    fi
  fi
done

if [[ "$FAILED_COUNT" -gt 0 ]]; then
  echo
  echo "❌ $FAILED_COUNT step(s) failed."
  exit "$FAILED_EXIT"
fi

echo
echo "✅ All tests passed (backend + Playwright)."
exit 0

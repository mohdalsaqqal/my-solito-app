#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

RG_EXCLUDES=(
  --glob '!**/node_modules/**'
  --glob '!**/.next/**'
  --glob '!**/dist/**'
)

if command -v rg >/dev/null 2>&1; then
  SEARCH_TOOL="rg"
else
  SEARCH_TOOL="grep"
fi

if command -v node.exe >/dev/null 2>&1; then
  NODE_BIN="node.exe"
elif [ -x /mnt/c/nvm4w/nodejs/node.exe ]; then
  NODE_BIN="/mnt/c/nvm4w/nodejs/node.exe"
elif command -v node >/dev/null 2>&1; then
  NODE_BIN="node"
else
  echo "[guard] Node.js binary is required for i18n checks."
  exit 1
fi

run_search() {
  local pattern="$1"
  shift

  if [ "$SEARCH_TOOL" = "rg" ]; then
    rg -n "${RG_EXCLUDES[@]}" "$pattern" "$@"
    return
  fi

  # grep fallback for environments where ripgrep is unavailable.
  grep -R -n -E --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=dist "$pattern" "$@"
}

run_check() {
  local label="$1"
  shift
  echo "[guard] $label"
  set +e
  "$@"
  local status=$?
  set -e

  if [ "$status" -eq 0 ]; then
    echo "[guard] Violation: $label"
    exit 1
  fi
  if [ "$status" -eq 1 ]; then
    return 0
  fi

  echo "[guard] Error while running check: $label (exit $status)"
  exit "$status"
}

run_check "No className in packages/app" \
  run_search "className=" packages/app

run_check "No inline style visual tokens bypass in shared packages" \
  run_search "style=\{\{[^}]*\\b(margin|padding|fontSize|lineHeight|fontWeight|borderRadius|color)\\b" packages/app packages/ui

run_check "No process.env in shared packages" \
  run_search "process.env" packages/app packages/ui

run_check "No tests in forbidden package locations" \
  run_search "__tests__" packages/app packages/ui

if [ "$SEARCH_TOOL" = "rg" ]; then
  run_check "No direct adapter imports in app/ui/expo/next app layer (except BFF)" \
    rg -n "${RG_EXCLUDES[@]}" "from '@real/adapters" packages/app packages/ui apps/expo apps/next/app --glob '!apps/next/app/api/**'
  run_check "No direct adapter imports in BFF routes" \
    rg -n "${RG_EXCLUDES[@]}" "from '@real/adapters" apps/next/app/api --glob '!apps/next/app/api/admin/**/sync/**'
else
  run_check "No direct adapter imports in app/ui/expo/next app layer (except BFF)" \
    grep -R -n -E --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=dist --exclude-dir=api "from '@real/adapters" packages/app packages/ui apps/expo apps/next/app
  # Skip BFF adapter check when using grep (ripgrep preferred for glob support)
  echo "[guard] Skipping BFF adapter check (install ripgrep for full check)"
fi

run_check "No provider imports inside packages/ui" \
  run_search "from '@real/providers" packages/ui

run_check "No raw hex colors in shared packages" \
  run_search "#[0-9a-fA-F]{3,8}" packages/app packages/ui

run_check "No deprecated Solito props" \
  run_search "viewProps=|textProps=" packages apps

run_check "No solito/router in App Router paths" \
  run_search "from ['\\\"]solito/router['\\\"]" apps/next/app packages/app

run_check "No unsupported pseudo classes in shared/native code" \
  run_search "visited:|before:|after:" packages/app packages/ui apps/expo

run_check "No reanimated side-effect import in Next app entries/layouts" \
  run_search "import ['\\\"]react-native-reanimated['\\\"]" apps/next

echo "[guard] CSS token bridge is up to date"
"$NODE_BIN" scripts/generate-css-token-bridge.mjs --check

echo "[guard] No new hardcoded user-facing strings"
"$NODE_BIN" tools/i18n/hardcoded-strings-check.mjs

echo "[guard] All checks passed"

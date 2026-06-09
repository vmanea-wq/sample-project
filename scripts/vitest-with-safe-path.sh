#!/usr/bin/env bash
# Vitest fails when the repo path contains ':' (Vite mis-resolves /@vite/env).
# In that case, mirror the tree to a temp directory without ':' and run there.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ "$ROOT" != *":"* ]]; then
  exec ./node_modules/.bin/vitest "$@"
fi

echo "vitest: project path contains ':' — running from a temp copy (one-time copy per run)." >&2
T="$(mktemp -d)"
cleanup() {
  rm -rf "$T"
}
trap cleanup EXIT
# Copy project without .git to keep size reasonable; keep node_modules for speed.
tar -cf - \
  --exclude='./.git' \
  -C "$ROOT" . | tar -xf - -C "$T"
cd "$T"
exec ./node_modules/.bin/vitest "$@"

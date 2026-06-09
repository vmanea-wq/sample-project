#!/usr/bin/env bash
# Snyk dependency scan → qa/reports/snyk-deps.json (requires SNYK_TOKEN).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
mkdir -p qa/reports

if [[ -z "${SNYK_TOKEN:-}" ]]; then
  echo '{"note":"SNYK_TOKEN not set","vulnerabilities":[],"criticalCount":0}' > qa/reports/snyk-deps.json
  echo "Snyk skipped (no SNYK_TOKEN)."
  exit 0
fi

npx --yes snyk@latest test --json --file=package-lock.json > qa/reports/snyk-deps.raw.json || true
node qa/scripts/normalize-snyk.mjs

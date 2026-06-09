#!/usr/bin/env bash
# Run k6 load test against a running preview server (default http://127.0.0.1:4173).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
mkdir -p qa/reports
export BASE_URL="${BASE_URL:-http://127.0.0.1:4173}"

if command -v k6 >/dev/null 2>&1; then
  k6 run qa/performance/ledger.k6.js --summary-export=qa/reports/k6-summary.json
else
  echo "k6 not found; using grafana/k6 Docker image."
  docker run --rm -i \
    -v "$ROOT:/work" -w /work \
    -e BASE_URL="$BASE_URL" \
    grafana/k6:latest run \
    qa/performance/ledger.k6.js \
    --summary-export=qa/reports/k6-summary.json
fi

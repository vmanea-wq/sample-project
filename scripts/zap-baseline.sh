#!/usr/bin/env bash
# OWASP ZAP baseline scan (Docker). Target must be reachable from the container.
# macOS/Windows: host.docker.internal. Linux: set TARGET explicitly (e.g. host IP).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
mkdir -p "$ROOT/qa/reports"
TARGET="${TARGET:-http://host.docker.internal:4173/}"

echo "ZAP baseline → $TARGET (reports: qa/reports/)"

docker run --rm \
  -v "$ROOT/qa/reports:/zap/wrk/:rw" \
  ghcr.io/zaproxy/zaproxy:stable \
  zap-baseline.py -t "$TARGET" -J zap-report.json -r zap-report.html || {
  echo "ZAP exited non-zero (findings or config). Reports still under qa/reports/."
}

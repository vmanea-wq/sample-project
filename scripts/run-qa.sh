#!/usr/bin/env bash
# Master QA runner: lint + complexity + unit coverage + build + preview + k6 + ZAP + Snyk + E2E + HTML dashboard.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
mkdir -p qa/reports

echo "=== ESLint (human + JSON report) ==="
npm run lint
npm run lint:report

echo "=== Cyclomatic complexity scan ==="
node qa/scripts/complexity-scan.mjs

echo "=== Unit tests + coverage (Vitest) ==="
npm run test:coverage

echo "=== Production build ==="
npm run build

echo "=== Start preview for perf/security probes ==="
npm run qa:preview &
PREVIEW_PID=$!
cleanup() {
  kill "$PREVIEW_PID" 2>/dev/null || true
}
trap cleanup EXIT
for i in {1..60}; do
  if curl -fsS "http://127.0.0.1:4173/" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

echo "=== k6 performance ==="
chmod +x scripts/k6-run.sh
./scripts/k6-run.sh || echo "k6 failed (install k6 or Docker); continuing."

echo "=== OWASP ZAP baseline (Docker) ==="
chmod +x scripts/zap-baseline.sh
./scripts/zap-baseline.sh || echo "ZAP reported issues or Docker unavailable; continuing."

echo "=== Snyk dependency scan ==="
chmod +x scripts/snyk-scan.sh
./scripts/snyk-scan.sh

cleanup
trap - EXIT

echo "=== Playwright E2E (Page Object Model) ==="
export PLAYWRIGHT_SKIP_WEBSERVER=1
npm run qa:preview &
PREVIEW_PID=$!
trap 'kill "$PREVIEW_PID" 2>/dev/null || true' EXIT
for i in {1..60}; do
  if curl -fsS "http://127.0.0.1:4173/" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done
npx playwright install chromium
npx playwright test
kill "$PREVIEW_PID" 2>/dev/null || true
trap - EXIT

echo "=== Pylint (QA Python helpers) ==="
if command -v pylint >/dev/null 2>&1; then
  pylint qa/python || true
else
  echo "pylint not installed; run: python3 -m pip install pylint"
fi

echo "=== Quality dashboard (HTML) ==="
node qa/scripts/build-dashboard.mjs

echo "=== Done. Open qa/reports/dashboard.html ==="

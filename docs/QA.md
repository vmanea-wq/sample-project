# QA automation suite

This repository includes a **full-stack QA pipeline** for Pocket Ledger: unit tests (Vitest), end-to-end tests (Playwright + **Page Object Model**), linting and cyclomatic complexity (ESLint), Python linting (Pylint on QA helpers), dependency and container security (Snyk, OWASP ZAP), load testing (k6), and an **HTML quality dashboard**.

## Quality targets (dashboard)

| Metric | Target | Source |
|--------|--------|--------|
| Test coverage (lines) | ≥ **80%** | Vitest + `@vitest/coverage-v8` → `coverage/coverage-summary.json` |
| Cyclomatic complexity | **&lt; 10** per function | ESLint `complexity` rule + `qa/reports/complexity.json` |
| Critical vulnerabilities | **0** (dependencies) | Snyk → `qa/reports/snyk-deps.json` |
| p95 response time | **&lt; 500 ms** | k6 → `qa/reports/k6-summary.json` |
| HTTP error rate | **&lt; 1%** | k6 thresholds |

## Run everything (master script)

```bash
chmod +x scripts/*.sh
npm run qa:all
```

This runs, in order: ESLint (human + JSON report) → complexity scan → **unit tests + coverage** → production build → preview server → **k6** → **OWASP ZAP baseline** (Docker) → **Snyk** (if `SNYK_TOKEN`) → **Playwright E2E** → optional **Pylint** → **HTML dashboard** at `qa/reports/dashboard.html`.

**Prerequisites:** Node 22+, Docker (for ZAP and optional k6), optional `k6` CLI, optional `pylint` (`python3 -m pip install pylint`).

## Individual commands

| Command | Purpose |
|---------|---------|
| `npm run lint` | ESLint on `src` |
| `npm run lint:report` | ESLint JSON → `qa/reports/eslint-report.json` |
| `npm run lint:complexity` | Same as `npm run qa:complexity` |
| `npm run test` | Vitest once |
| `npm run test:watch` | Vitest watch (run from a path **without** `:` if Vitest errors) |
| `npm run test:coverage` | Vitest + coverage thresholds (uses `scripts/vitest-with-safe-path.sh` if path contains `:`) |
| `npm run qa:complexity` | Cyclomatic scan → `qa/reports/complexity.json` |
| `npm run qa:dashboard` | Build `qa/reports/dashboard.html` from report JSON |
| `npm run qa:e2e` | Playwright (starts preview; run `npm run build` first if `dist` missing) |
| `npm run qa:k6` | k6 load script (`qa/performance/ledger.k6.js`) |
| `npm run qa:zap` | OWASP ZAP baseline (`scripts/zap-baseline.sh`) |
| `npm run qa:snyk` | Snyk deps JSON (`scripts/snyk-scan.sh`) |
| `npm run pylint` | Pylint on `qa/python/` |

## Project path containing `:` (Vitest / Vite)

If the folder name includes a colon (for example `…/ci:cd`), **Vite’s virtual module `/@vite/env` fails to resolve** and Vitest will not start in that directory. This repo ships **`scripts/vitest-with-safe-path.sh`**, which **`npm run test`** and **`npm run test:coverage`** invoke automatically: they mirror the project to a temp path without `:` and run Vitest there.

**Recommendation:** clone or rename the repo to a path without `:` for faster runs (no copy step). **GitHub Actions** checkouts do not include `:` in the workspace path, so CI is unaffected.

## Page Object Model (E2E)

- **Base:** `qa/e2e/pages/base.page.ts`
- **Ledger UI:** `qa/e2e/pages/ledger.page.ts`
- **Specs:** `qa/e2e/specs/ledger.spec.ts`

Playwright config: `playwright.config.ts` (Chromium, preview server, `PLAYWRIGHT_SKIP_WEBSERVER=1` when `run-qa.sh` already serves preview).

## Security

- **OWASP ZAP:** `scripts/zap-baseline.sh` — targets `http://host.docker.internal:4173/` by default (macOS/Windows). On Linux, set `TARGET`, e.g. `TARGET=http://172.17.0.1:4173/ ./scripts/zap-baseline.sh`.
- **Snyk:** set repository secret `SNYK_TOKEN`; otherwise `qa:snyk` writes an empty report and skips the CLI.

## Pylint (Python)

There is **no application Python** in this repo; **Pylint** runs on **`qa/python/report_validators.py`** (shared metric helpers). Configure via `pyproject.toml`.

## Reports

Generated files live under `qa/reports/` (gitignored except `.gitkeep`) and `coverage/`. Open **`qa/reports/dashboard.html`** in a browser after `npm run qa:dashboard` (or after `qa:all`).

## CI

`.github/workflows/ci.yml` includes `test:coverage` in the quality matrix so every PR/push runs unit tests and coverage gates.

## Related docs

- [Deployment and security automation](DEPLOYMENT.md)
- [Pipeline performance notes](PERFORMANCE.md)

# Pocket Ledger

[![CI](https://github.com/vmanea-wq/sample-project/actions/workflows/ci.yml/badge.svg)](https://github.com/vmanea-wq/sample-project/actions/workflows/ci.yml)
[![Deploy GitHub Pages](https://github.com/vmanea-wq/sample-project/actions/workflows/pages.yml/badge.svg)](https://github.com/vmanea-wq/sample-project/actions/workflows/pages.yml)
[![CodeQL](https://github.com/vmanea-wq/sample-project/actions/workflows/codeql.yml/badge.svg)](https://github.com/vmanea-wq/sample-project/actions/workflows/codeql.yml)
[![Uptime](https://github.com/vmanea-wq/sample-project/actions/workflows/uptime.yml/badge.svg)](https://github.com/vmanea-wq/sample-project/actions/workflows/uptime.yml)

A small **money management** web app: log income and expenses, see your balance, and keep everything in the browser with `localStorage` (no server).

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Scripts

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Dev server with HMR |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc -b` only |
| `npm run build:vite` | Vite production bundle only |
| `npm run build` | Typecheck + Vite build (local parity) |
| `npm run preview` | Preview the production build |
| `npm run test` | Vitest (unit + component tests) |
| `npm run test:coverage` | Vitest with **80%+** coverage gates |
| `npm run qa:all` | Full QA pipeline (lint, security, k6, ZAP, E2E, dashboard) — see [docs/QA.md](docs/QA.md) |

## QA automation

End-to-end and quality tooling (Playwright **Page Object Model**, k6, ZAP, Snyk, ESLint complexity, Pylint, HTML dashboard) is documented in **[docs/QA.md](docs/QA.md)**.

## Features

- Income vs expense toggle
- Balance, total income, and total expenses
- Recent activity list with delete
- Clear all (with confirmation)
- Data persists in **localStorage** under the key `money-manager:transactions`

Built with [Vite](https://vite.dev/) + [React](https://react.dev/) + TypeScript.

## CI/CD overview

| Workflow | When | What |
| -------- | ---- | ---- |
| [`.github/workflows/ci.yml`](.github/workflows/ci.yml) | Push / PR to `main` | **Parallel** lint, typecheck, Vite build, **Vitest + coverage**; **OSV**, **`npm audit`**, optional **Snyk**; **Docker** build with **BuildKit GHA cache** (pushes only); optional **Slack** on failure |
| [`.github/workflows/codeql.yml`](.github/workflows/codeql.yml) | Push / PR / weekly | **SAST** (CodeQL JavaScript) |
| [`.github/workflows/pages.yml`](.github/workflows/pages.yml) | Push / manual | Build → **GitHub Pages** deploy → **HTTP health check** → optional **auto-rollback** + **Slack** on failure |
| [`.github/workflows/rollback-pages.yml`](.github/workflows/rollback-pages.yml) | Manual / dispatched | Rebuild and redeploy an arbitrary **git ref** (manual rollback) |
| [`.github/workflows/uptime.yml`](.github/workflows/uptime.yml) | Schedule / manual | **Synthetic monitor** (HTTP GET) + optional **Slack** on failure |

Caching lives in [`.github/actions/setup-node-deps`](.github/actions/setup-node-deps/action.yml) (npm cache + `node_modules` restore / skip `npm ci`).

**Blue/green on GitHub Pages:** not supported as a second URL slot; see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for what we do instead and how to evolve to a true blue/green platform.

**Performance notes:** [docs/PERFORMANCE.md](docs/PERFORMANCE.md) (includes why **pip** caching is not applicable here).

### Optional repository secrets

| Secret | Purpose |
| ------ | ------- |
| `SLACK_WEBHOOK_URL` | Slack incoming webhook for failure notifications |
| `SNYK_TOKEN` | Enables Snyk in CI when set |

If `SLACK_WEBHOOK_URL` is unset, notification jobs exit successfully without posting.

### Enable the live site

1. In the repo on GitHub: **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions** (not “Deploy from a branch”).
3. After the first successful **Deploy GitHub Pages** run, the app is available at  
   `https://vmanea-wq.github.io/sample-project/`  
   (replace with your username if the repo is under a different account or renamed).

Local dev keeps the default base path `/`. Only the Pages workflow sets `BASE_PATH` for correct asset URLs on a project site.

### Docker (optional runtime)

```bash
docker build -t pocket-ledger .
docker run --rm -p 8080:80 pocket-ledger
```

Then open `http://localhost:8080`.

# Deployment model

This app is a **static Vite + React** site. Production hosting here is **GitHub Pages**, which publishes a **single URL** per repository. GitHub swaps the site atomically when a deployment completes; there is **no first-class blue/green pair of URLs** or weighted traffic split like you would get on Kubernetes, Cloud Run, or a CDN with staging/production origins.

## What we implement instead

| Technique | Where | What it does |
|-----------|--------|----------------|
| **Parallel CI checks** | `.github/workflows/ci.yml` | Lint, TypeScript, and Vite build run in **three parallel jobs** after cached installs. |
| **Security** | CI + CodeQL | **OSV-Scanner** (lockfile), **`npm audit`**, optional **Snyk**, and **CodeQL** (SAST for JavaScript/TypeScript). |
| **Docker** | `Dockerfile` + CI | Optional **container** path: multi-stage image with **BuildKit `type=gha`** layer cache in CI (no registry push in this repo). |
| **Post-deploy verification** | `.github/workflows/pages.yml` | **HTTP health check** with retries against the live Pages URL. |
| **Automated rollback** | `pages.yml` → `rollback-pages.yml` | If a **push** deploy succeeds but the **health check fails**, a workflow run is queued for **`rollback-pages.yml`** using `github.event.before` (previous commit). This re-publishes the last known-good tree—not a second “blue” slot. |
| **Manual rollback** | Actions → **Rollback GitHub Pages** | Pick any **commit SHA** (or ref) to rebuild and redeploy. |

## True blue/green

For **blue/green** or **canary** traffic, use a platform that supports two revisions or weighted routes (for example **Cloud Run**, **AWS CodeDeploy**, **Kubernetes**, or **Cloudflare Workers**). You can reuse this repo’s **`Dockerfile`** as the deployable unit on those platforms.

## Secrets (optional)

| Secret | Purpose |
|--------|---------|
| `SLACK_WEBHOOK_URL` | Incoming webhook for failure alerts (CI, Pages, uptime, rollback). |
| `SNYK_TOKEN` | Enables Snyk in CI when set. |

Slack steps **no-op** when the webhook is unset.

## Monitoring

`.github/workflows/uptime.yml` runs on a **schedule** (and manually) and performs an HTTP GET against the public Pages URL. Failures can notify Slack the same way as CI/Pages.

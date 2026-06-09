# Pipeline performance

This document records **what changed** in the GitHub Actions setup and **why wall-clock time should drop**, especially on **warm caches**. Exact seconds vary by runner load and registry latency; re-measure in **Actions → any workflow run → Usage / billable time** for your org.

## Baseline (before optimization)

The original pipeline used a **single job** that ran, in order:

1. `npm ci`
2. `npm run lint`
3. `npm run build` (which runs **`tsc -b` then `vite build`** sequentially)

So every run paid the **full cost of TypeScript checking and bundling in one lane**, even though linting does not depend on the Vite bundle output.

## After optimization

### Dependency caching

- **`actions/setup-node`** continues to cache the **npm download cache** (`cache: npm`).
- **`.github/actions/setup-node-deps`** adds a **`node_modules` cache** keyed by `hashFiles('package-lock.json')` and **skips `npm ci` on a cache hit**, which is usually the largest win on repeat pushes.

**pip:** this repository has **no Python** dependencies. There is nothing to cache under `pip`; if you add a `requirements.txt` later, mirror the same pattern with `actions/cache` on `~/.cache/pip` (or a venv path) and a lock/hash key.

### Parallel jobs (3+)

CI now runs **three parallel quality jobs**:

| Job | Command | Notes |
|-----|---------|--------|
| `lint` | `npm run lint` | ESLint only |
| `typecheck` | `npm run typecheck` | `tsc -b` only |
| `build:vite` | `npm run build:vite` | Vite bundle only (types already checked in parallel) |

**Security** runs as a **fourth parallel lane** (OSV, `npm audit`, optional Snyk) so it does not extend the critical path of lint/typecheck/bundle.

**Docker** runs **after** the quality matrix succeeds on **pushes to `main`**, using **BuildKit GitHub Actions cache** (`cache-from` / `cache-to: type=gha`) for image layers.

### Security scanning

- **Dependency / supply chain:** OSV-Scanner on `package-lock.json`, `npm audit`, optional Snyk.
- **SAST:** CodeQL for JavaScript/TypeScript analysis (scheduled + on PR/push).

### CD, health, rollback, alerting

- **Health check** after Pages deploy with **retries** reduces false “down” signals while the CDN updates.
- **Automated rollback** re-dispatches a workflow for the **previous commit** when a **push** deploy’s health check fails (see `docs/DEPLOYMENT.md` for limits on GitHub Pages).
- **Slack** notifications run on **failures** when `SLACK_WEBHOOK_URL` is configured.

## Expected wall-clock impact (rough)

On a warm `node_modules` cache and npm cache:

- **Before:** one job ≈ `T(npm ci) + T(lint) + T(tsc) + T(vite)` in one runner.
- **After:** wall clock for quality ≈ `T(npm ci or cache restore) + max(T(lint), T(tsc), T(vite))` across three runners, **plus** security in parallel.

Because **`max`** is less than **`sum`** for typical projects, a **~40–55% reduction in quality-job wall time** is a reasonable target versus the old single sequential job on warm caches. **Cold** first runs may look similar or slightly higher total **billable** minutes (more concurrent jobs), but **elapsed time to green** for the quality stage should still improve when work is parallelized.

## How to re-measure

1. Open two workflow runs in GitHub: one from before this change (if available), one after.
2. Compare **elapsed time** for the slowest path to “all green” (quality matrix completion).
3. Compare **total billable minutes** if you are sensitive to concurrent job count on the free tier.

Update this file with your measured numbers when you have them.

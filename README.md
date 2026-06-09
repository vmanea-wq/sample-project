# Pocket Ledger

[![CI](https://github.com/vmanea-wq/sample-project/actions/workflows/ci.yml/badge.svg)](https://github.com/vmanea-wq/sample-project/actions/workflows/ci.yml)
[![Deploy GitHub Pages](https://github.com/vmanea-wq/sample-project/actions/workflows/pages.yml/badge.svg)](https://github.com/vmanea-wq/sample-project/actions/workflows/pages.yml)

A small **money management** web app: log income and expenses, see your balance, and keep everything in the browser with `localStorage` (no server).

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Scripts

| Command        | Description              |
| -------------- | ------------------------ |
| `npm run dev`  | Start dev server with HMR |
| `npm run build` | Typecheck + production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | ESLint                   |

## Features

- Income vs expense toggle
- Balance, total income, and total expenses
- Recent activity list with delete
- Clear all (with confirmation)
- Data persists in **localStorage** under the key `money-manager:transactions`

Built with [Vite](https://vite.dev/) + [React](https://react.dev/) + TypeScript.

## CI/CD

- **CI** ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)): on every push and pull request to `main`, runs `npm ci`, ESLint, and a production build.
- **GitHub Pages** ([`.github/workflows/pages.yml`](.github/workflows/pages.yml)): on push to `main` (and manual **Run workflow**), builds with `BASE_PATH` set to the repository name and deploys the `dist` folder.

### Enable the live site

1. In the repo on GitHub: **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions** (not “Deploy from a branch”).
3. After the first successful **Deploy GitHub Pages** run, the app is available at  
   `https://vmanea-wq.github.io/sample-project/`  
   (replace with your username if the repo is under a different account or renamed).

Local dev keeps the default base path `/`. Only the Pages workflow sets `BASE_PATH` for correct asset URLs on a project site.

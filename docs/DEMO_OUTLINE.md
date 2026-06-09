# Demo video outline (5–10 minutes)

Use this as a shot list while recording your screen (browser + optional terminal). Replace the repo/demo URLs if yours differ.

## 0:00–0:45 — Intro

- Who you are (optional) and what **Pocket Ledger** does: track income/expenses in the browser, no login, data in `localStorage`.
- Show **GitHub repo** in the browser: `https://github.com/vmanea-wq/sample-project` (or your fork).

## 0:45–2:30 — Live app

- Open the **deployed site** (GitHub Pages): `https://vmanea-wq.github.io/sample-project/`
- Add an **expense** and an **income**; point out balance and totals updating.
- Delete one row; mention **Clear all** and confirm dialog (optional quick demo).

## 2:30–4:00 — Local setup (terminal)

- Clone / `cd` into the project, `npm install`, `npm run dev`, open localhost.
- (Optional) `npm run build` + `npm run preview` to show production build.

## 4:00–6:00 — Tests & coverage

- Run `npm run test:coverage`; scroll terminal summary (pass + coverage %).
- Open **`coverage/index.html`** in the browser (generated under `coverage/`) and show the file tree / percentages.

## 6:00–7:30 — CI/CD

- GitHub → **Actions** tab; open a green **CI** workflow run; scroll jobs (lint, typecheck, build, tests, security, Docker on push).
- Open a successful **Deploy GitHub Pages** run if available.

## 7:30–9:00 — Quality dashboard (optional but strong)

- After `npm run qa:dashboard` (or a trimmed `npm run lint:report && npm run test:coverage && npm run qa:complexity && npm run qa:dashboard`), open **`qa/reports/dashboard.html`** and walk through the metrics table.

## 9:00–10:00 — Architecture & wrap-up

- Show **`docs/ARCHITECTURE.md`** on GitHub (Mermaid diagrams) or a slide with exported diagram.
- One sentence: stack (Vite, React, TypeScript), persistence (localStorage), deploy (GitHub Pages).
- Thank you / link to repo again.

### Tips

- **1080p**, clear mic, hide unrelated bookmarks/tabs.
- If Pages is not deployed yet, record the **local** app for the demo segment and say “production URL pending” or enable Pages first.

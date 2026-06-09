# Pocket Ledger

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

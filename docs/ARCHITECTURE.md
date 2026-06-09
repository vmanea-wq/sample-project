# Architecture — Pocket Ledger

Pocket Ledger is a **static single-page application (SPA)**. All state lives in the browser; there is no backend service in this repository.

## System context

```mermaid
flowchart LR
  subgraph Browser
    UI[React UI]
    LS[(localStorage)]
  end
  User((User)) --> UI
  UI <--> LS
```

- **React 19** renders the UI and handles forms and lists.
- **`localStorage`** persists the transaction list under the key `money-manager:transactions` (see [`transactionsStorage.ts`](../src/lib/transactionsStorage.ts)).
- **No server**: builds to static files (`dist/`) served by GitHub Pages, nginx (Docker), or any static host.

## Source layout (logical)

```mermaid
flowchart TB
  subgraph entry
    M[main.tsx]
  end
  subgraph app
    A[App.tsx]
    H[useTransactions hook]
    L1[ledgerMath.ts]
    L2[transactionsStorage.ts]
    L3[formatLedgerWhen.ts]
    T[types.ts]
  end
  subgraph qa
    E2E[Playwright POM + specs]
    UT[Vitest unit tests]
  end
  M --> A
  A --> H
  H --> L1
  H --> L2
  A --> L3
  H --> T
  UT -.-> L1
  UT -.-> L2
  UT -.-> H
  E2E -.-> A
```

| Area | Responsibility |
|------|------------------|
| [`App.tsx`](../src/App.tsx) | Layout, form, list, summaries; wires hook to UI. |
| [`useTransactions.ts`](../src/useTransactions.ts) | React state, `add` / `remove` / `clearAll`, sync to storage. |
| [`ledgerMath.ts`](../src/lib/ledgerMath.ts) | Pure totals (income, expense, balance). |
| [`transactionsStorage.ts`](../src/lib/transactionsStorage.ts) | Parse and load persisted JSON safely. |
| [`formatLedgerWhen.ts`](../src/lib/formatLedgerWhen.ts) | Locale-aware timestamps in the list. |

## Build & deploy

```mermaid
flowchart LR
  subgraph dev
    V[Vite dev server]
  end
  subgraph ci["GitHub Actions"]
    T[tsc + ESLint + Vitest]
    B[npm run build]
    P[upload-pages-artifact]
    D[deploy-pages]
  end
  SRC[src/] --> T
  SRC --> B
  B --> dist[dist/]
  dist --> P --> D
  D --> GH[GitHub Pages CDN]
```

- **Vite** bundles TypeScript + React; `BASE_PATH` is set in CI only for GitHub Pages project URLs (see [`vite.config.ts`](../vite.config.ts)).
- **CI** runs quality checks and produces the static site artifact for Pages (see [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) and [`pages.yml`](../.github/workflows/pages.yml)).

## QA automation (high level)

```mermaid
flowchart TB
  subgraph local_or_ci
    VT[Vitest + coverage]
    PW[Playwright E2E]
    K6[k6 load]
    ZAP[OWASP ZAP]
    SNY[Snyk deps]
    DASH[HTML dashboard]
  end
  VT --> DASH
  PW --> DASH
  K6 --> DASH
  ZAP --> DASH
  SNY --> DASH
```

Details: [QA.md](./QA.md).

## Rendering diagrams

- **GitHub:** Mermaid in Markdown renders in the web UI when viewing `docs/ARCHITECTURE.md` in the repo.
- **Elsewhere:** paste the fenced `mermaid` blocks into [Mermaid Live Editor](https://mermaid.live) to export PNG/SVG for slides.

## Related documentation

- [QA automation](./QA.md)
- [Deployment model](./DEPLOYMENT.md)
- [CI performance notes](./PERFORMANCE.md)

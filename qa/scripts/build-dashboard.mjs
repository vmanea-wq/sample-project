#!/usr/bin/env node
/**
 * Aggregates QA tool outputs into qa/reports/dashboard.html
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const reports = path.join(root, 'qa/reports')

function readJson(file, fallback) {
  try {
    const p = path.join(reports, file)
    if (!fs.existsSync(p)) return fallback
    return JSON.parse(fs.readFileSync(p, 'utf8'))
  } catch {
    return fallback
  }
}

function readCoveragePct() {
  const p = path.join(root, 'coverage/coverage-summary.json')
  if (!fs.existsSync(p)) return null
  const j = JSON.parse(fs.readFileSync(p, 'utf8'))
  const t = j.total
  if (!t?.lines?.pct) return null
  return Number(t.lines.pct)
}

const coveragePct = readCoveragePct()
const complexity = readJson('complexity.json', {
  maxObservedComplexity: null,
  pass: null,
  violationCount: null,
})
const eslintReportPath = path.join(reports, 'eslint-report.json')
let eslintErrors = 0
let eslintWarnings = 0
if (fs.existsSync(eslintReportPath)) {
  const rows = JSON.parse(fs.readFileSync(eslintReportPath, 'utf8'))
  for (const f of rows) {
    eslintErrors += f.errorCount ?? 0
    eslintWarnings += f.warningCount ?? 0
  }
}

const k6 = readJson('k6-summary.json', null)
let k6P95ms = null
let k6FailRate = null
if (k6?.metrics?.http_req_duration?.values?.['p(95)'] != null) {
  k6P95ms = k6.metrics.http_req_duration.values['p(95)']
}
if (k6?.metrics?.http_req_failed?.values?.rate != null) {
  k6FailRate = k6.metrics.http_req_failed.values.rate * 100
}

const snyk = readJson('snyk-deps.json', null)
let criticalVulns = null
if (snyk?.criticalCount != null) {
  criticalVulns = snyk.criticalCount
} else if (Array.isArray(snyk?.vulnerabilities)) {
  criticalVulns = snyk.vulnerabilities.filter(
    (v) => String(v?.severity ?? '').toLowerCase() === 'critical',
  ).length
}

const targets = {
  coverageMin: 80,
  complexityMax: 10,
  criticalVulnsMax: 0,
  p95MsMax: 500,
  errorRateMaxPct: 1,
}

const rows = [
  {
    name: 'Test coverage (lines %)',
    value: coveragePct ?? 'n/a',
    target: `≥ ${targets.coverageMin}%`,
    pass: coveragePct == null ? null : coveragePct >= targets.coverageMin,
  },
  {
    name: 'Max cyclomatic complexity',
    value: complexity.maxObservedComplexity ?? 'n/a',
    target: `< ${targets.complexityMax}`,
    pass:
      complexity.maxObservedComplexity == null
        ? null
        : complexity.maxObservedComplexity < targets.complexityMax &&
          (complexity.violationCount ?? 0) === 0,
  },
  {
    name: 'ESLint errors / warnings',
    value: `${eslintErrors} / ${eslintWarnings}`,
    target: '0 errors',
    pass: eslintErrors === 0,
  },
  {
    name: 'Critical vulnerabilities (Snyk deps)',
    value: criticalVulns ?? 'n/a',
    target: `${targets.criticalVulnsMax}`,
    pass: criticalVulns == null ? null : criticalVulns <= targets.criticalVulnsMax,
  },
  {
    name: 'k6 p(95) response time (ms)',
    value: k6P95ms == null ? 'n/a' : Math.round(k6P95ms),
    target: `< ${targets.p95MsMax} ms`,
    pass: k6P95ms == null ? null : k6P95ms < targets.p95MsMax,
  },
  {
    name: 'k6 HTTP error rate %',
    value: k6FailRate == null ? 'n/a' : Number(k6FailRate.toFixed(3)),
    target: `< ${targets.errorRateMaxPct}%`,
    pass: k6FailRate == null ? null : k6FailRate < targets.errorRateMaxPct,
  },
]

function badge(pass) {
  if (pass === true) return '<span class="ok">PASS</span>'
  if (pass === false) return '<span class="fail">FAIL</span>'
  return '<span class="na">N/A</span>'
}

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>QA Quality Dashboard</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
  <style>
    :root { font-family: system-ui, sans-serif; background: #0f172a; color: #e2e8f0; }
    body { margin: 0; padding: 1.5rem; max-width: 960px; margin-inline: auto; }
    h1 { font-size: 1.35rem; }
    table { width: 100%; border-collapse: collapse; margin: 1rem 0 2rem; }
    th, td { border: 1px solid #334155; padding: 0.5rem 0.65rem; text-align: left; }
    th { background: #1e293b; }
    .ok { color: #4ade80; font-weight: 600; }
    .fail { color: #f87171; font-weight: 600; }
    .na { color: #94a3b8; }
    canvas { max-width: 100%; background: #1e293b; border-radius: 8px; padding: 0.75rem; }
    .meta { color: #94a3b8; font-size: 0.9rem; }
  </style>
</head>
<body>
  <h1>QA quality dashboard</h1>
  <p class="meta">Generated ${new Date().toISOString()} — sources under <code>qa/reports/</code> and <code>coverage/</code></p>
  <table>
    <thead><tr><th>Metric</th><th>Observed</th><th>Target</th><th>Status</th></tr></thead>
    <tbody>
      ${rows
        .map(
          (r) => `<tr>
        <td>${r.name}</td>
        <td>${r.value}</td>
        <td>${r.target}</td>
        <td>${badge(r.pass)}</td>
      </tr>`,
        )
        .join('')}
    </tbody>
  </table>
  <canvas id="chart" height="140"></canvas>
  <script>
    const labels = ${JSON.stringify(rows.map((r) => r.name))};
    const values = ${JSON.stringify(
      rows.map((r) => {
        if (typeof r.value === 'number') return r.value
        const n = Number(r.value)
        return Number.isFinite(n) ? n : 0
      }),
    )};
    const ctx = document.getElementById('chart');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{ label: 'Observed (numeric only)', data: values, backgroundColor: '#38bdf8' }],
      },
      options: {
        responsive: true,
        plugins: { legend: { labels: { color: '#e2e8f0' } } },
        scales: {
          x: { ticks: { color: '#cbd5e1', maxRotation: 45, minRotation: 25 } },
          y: { ticks: { color: '#cbd5e1' }, beginAtZero: true },
        },
      },
    });
  </script>
</body>
</html>`

fs.mkdirSync(reports, { recursive: true })
fs.writeFileSync(path.join(reports, 'dashboard.html'), html)
console.log('Wrote qa/reports/dashboard.html')

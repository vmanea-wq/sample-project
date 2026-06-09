#!/usr/bin/env node
/**
 * Runs ESLint programmatically and writes qa/reports/complexity.json
 * with max cyclomatic complexity vs target (<10).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { ESLint } from 'eslint'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const reports = path.join(root, 'qa/reports')
fs.mkdirSync(reports, { recursive: true })

const eslint = new ESLint({ cwd: root })
const results = await eslint.lintFiles(['src/**/*.{ts,tsx}'])

let maxObserved = 0
const violations = []

for (const file of results) {
  for (const m of file.messages) {
    if (m.ruleId === 'complexity') {
      violations.push({
        file: path.relative(root, file.filePath),
        line: m.line,
        column: m.column,
        message: m.message,
      })
      const match = /complexity of (\d+)/i.exec(m.message)
      if (match) maxObserved = Math.max(maxObserved, Number(match[1]))
    }
  }
}

const target = 10
const payload = {
  targetMaxComplexity: target,
  maxObservedComplexity: maxObserved,
  pass: maxObserved < target && violations.length === 0,
  violationCount: violations.length,
  violations,
  generatedAt: new Date().toISOString(),
}

fs.writeFileSync(path.join(reports, 'complexity.json'), JSON.stringify(payload, null, 2))
console.log(
  `Complexity scan: max=${maxObserved} (target <${target}), violations=${violations.length}`,
)

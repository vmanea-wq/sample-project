import fs from 'node:fs'

const rawPath = 'qa/reports/snyk-deps.raw.json'
let data
try {
  data = JSON.parse(fs.readFileSync(rawPath, 'utf8'))
} catch {
  data = {}
}

let vulns = []
if (Array.isArray(data)) vulns = data
else if (Array.isArray(data.vulnerabilities)) vulns = data.vulnerabilities
else if (data.vulnerabilities && typeof data.vulnerabilities === 'object')
  vulns = Object.values(data.vulnerabilities).flat()

const criticalCount = vulns.filter(
  (v) => String(v?.severity ?? '').toLowerCase() === 'critical',
).length

fs.writeFileSync(
  'qa/reports/snyk-deps.json',
  JSON.stringify({ vulnerabilities: vulns, criticalCount }, null, 2),
)

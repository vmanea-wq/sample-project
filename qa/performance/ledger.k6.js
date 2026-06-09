import http from 'k6/http'
import { check, sleep } from 'k6'
import { Rate } from 'k6/metrics'

const errors = new Rate('errors')

export const options = {
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
    errors: ['rate<0.01'],
  },
  stages: [
    { duration: '10s', target: 5 },
    { duration: '25s', target: 15 },
    { duration: '10s', target: 0 },
  ],
}

const BASE = __ENV.BASE_URL || 'http://127.0.0.1:4173'

export default function () {
  const res = http.get(BASE)
  const ok = check(res, {
    'status 200': (r) => r.status === 200,
    'has root shell': (r) =>
      typeof r.body === 'string' && r.body.includes('id="root"'),
  })
  errors.add(!ok)
  sleep(0.25)
}

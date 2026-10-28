import { check } from 'k6'
import http from 'k6/http'

const baseUrl = __ENV.BASE_URL
const bypassSecret = __ENV.VERCEL_AUTOMATION_BYPASS_SECRET

if (!baseUrl) {
  throw new Error('BASE_URL is required and must be a staging deployment.')
}

const requestParams = {
  headers: bypassSecret
    ? {
        'x-vercel-protection-bypass': bypassSecret,
        'x-vercel-set-bypass-cookie': 'true',
      }
    : {},
  tags: { page: 'cached-home' },
}

export const options = {
  scenarios: {
    cached_pages: {
      executor: 'constant-arrival-rate',
      rate: 500,
      timeUnit: '1s',
      duration: '5m',
      preAllocatedVUs: 200,
      maxVUs: 1000,
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<800'],
  },
}

export function setup() {
  const warmup = http.get(baseUrl, requestParams)
  check(warmup, {
    'warm-up returns HTTP 200': (response) => response.status === 200,
  })
}

function loadCachedPage() {
  const response = http.get(baseUrl, requestParams)
  check(response, {
    'cached page returns HTTP 200': (result) => result.status === 200,
    'response is served from Vercel cache': (result) =>
      ['HIT', 'STALE'].includes(result.headers['X-Vercel-Cache']),
  })
}

export default loadCachedPage

const baseUrl = process.env.BASE_URL
const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET

if (!baseUrl) {
  throw new Error('BASE_URL is required.')
}

const origin = new URL(baseUrl).origin
const headers = bypassSecret
  ? {
      'x-vercel-protection-bypass': bypassSecret,
      'x-vercel-set-bypass-cookie': 'true',
    }
  : {}

let url = new URL(baseUrl)
let response
for (let redirects = 0; redirects <= 5; redirects += 1) {
  response = await fetch(url, {
    redirect: 'manual',
    signal: AbortSignal.timeout(10_000),
    headers,
  })
  if (![301, 302, 303, 307, 308].includes(response.status)) break

  const location = response.headers.get('location')
  if (!location) {
    throw new Error('Security-header request returned a redirect without a Location header.')
  }
  const redirectUrl = new URL(location, url)
  if (redirectUrl.origin !== origin) {
    throw new Error('Security-header request redirected outside the deployment origin.')
  }
  if (redirects === 5) {
    throw new Error('Security-header request exceeded the redirect limit.')
  }
  url = redirectUrl
}

if (!response.ok) {
  throw new Error(`Header verification request failed: HTTP ${response.status}`)
}

const hsts = response.headers.get('strict-transport-security') ?? ''
const maxAge = Number(hsts.match(/(?:^|;)\s*max-age=(\d+)/i)?.[1] ?? 0)
const required = [
  ['x-content-type-options', /^nosniff$/i],
  ['referrer-policy', /^strict-origin-when-cross-origin$/i],
  ['permissions-policy', /camera=\(\).*microphone=\(\).*geolocation=\(self\)/i],
  ['cross-origin-opener-policy', /^same-origin$/i],
]

const missing = required
  .filter(([name, pattern]) => !pattern.test(response.headers.get(name) ?? ''))
  .map(([name]) => name)

if (maxAge < 31_536_000 || !/includeSubDomains/i.test(hsts)) {
  missing.push('strict-transport-security with one-year max-age and includeSubDomains')
}

const csp = response.headers.get('content-security-policy') ?? ''
if (!/(?:^|;)\s*default-src\s+'self'(?:;|$)/.test(csp)) {
  missing.push('content-security-policy default-src')
}
if (!/(?:^|;)\s*script-src\b[^;]*'nonce-[A-Za-z0-9+/_=-]+'/.test(csp)) {
  missing.push('content-security-policy with per-response script nonce')
}
if (!/(?:^|;)\s*frame-ancestors\s+'none'(?:;|$)/.test(csp)) {
  missing.push('content-security-policy frame-ancestors')
}
if (!/(?:^|;)\s*base-uri\s+'self'(?:;|$)/.test(csp)) {
  missing.push('content-security-policy base-uri')
}

if (missing.length > 0) {
  throw new Error(`Required security headers are missing or invalid: ${missing.join(', ')}`)
}

process.stdout.write('Required security headers are present.\n')

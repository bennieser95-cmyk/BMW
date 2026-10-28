const baseUrl = process.env.BASE_URL

if (!baseUrl) {
  throw new Error('BASE_URL must contain the staged production deployment URL.')
}

const parsedBaseUrl = new URL(baseUrl)
if (parsedBaseUrl.protocol !== 'https:' || parsedBaseUrl.username || parsedBaseUrl.password) {
  throw new Error('BASE_URL must be an HTTPS URL without embedded credentials.')
}

const headers = process.env.VERCEL_AUTOMATION_BYPASS_SECRET
  ? {
      'x-vercel-protection-bypass': process.env.VERCEL_AUTOMATION_BYPASS_SECRET,
      'x-vercel-set-bypass-cookie': 'true',
    }
  : {}

for (const path of ['/api/health', '/']) {
  let url = new URL(path, baseUrl)
  let response
  for (let redirects = 0; redirects <= 5; redirects += 1) {
    response = await fetch(url, {
      headers,
      redirect: 'manual',
      signal: AbortSignal.timeout(10_000),
    })
    if (![301, 302, 303, 307, 308].includes(response.status)) break

    const location = response.headers.get('location')
    if (!location) {
      throw new Error(`Smoke check for ${path} returned a redirect without a Location header.`)
    }
    const redirectUrl = new URL(location, url)
    if (redirectUrl.origin !== parsedBaseUrl.origin) {
      throw new Error(`Smoke check for ${path} redirected outside the deployment origin.`)
    }
    if (redirects === 5) {
      throw new Error(`Smoke check for ${path} exceeded the redirect limit.`)
    }
    url = redirectUrl
  }

  if (!response.ok) {
    throw new Error(`Smoke check failed for ${path}: HTTP ${response.status}`)
  }
}

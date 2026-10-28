module.exports = async (browser, context) => {
  const baseUrl = process.env.BASE_URL
  const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET

  if (!baseUrl || !bypassSecret) {
    throw new Error('BASE_URL and the staging bypass secret are required for Lighthouse.')
  }

  const target = new URL(context.url)
  if (target.origin !== new URL(baseUrl).origin) {
    throw new Error('Lighthouse URL does not match the validated staging deployment origin.')
  }

  const page = await browser.newPage()
  await page.setRequestInterception(true)
  page.on('request', (request) => {
    const requestUrl = new URL(request.url())
    const headers = request.headers()
    if (requestUrl.origin === target.origin) {
      headers['x-vercel-protection-bypass'] = bypassSecret
      headers['x-vercel-set-bypass-cookie'] = 'true'
    }
    void request.continue({ headers })
  })

  try {
    const response = await page.goto(target.toString(), {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    })
    if (!response?.ok() || new URL(page.url()).origin !== target.origin) {
      throw new Error('Could not establish the Vercel bypass cookie on the staging origin.')
    }
  } finally {
    await page.close()
  }
}

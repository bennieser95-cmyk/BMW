import { test as base, expect, request as playwrightRequest } from '@playwright/test'

export { expect }

const baseURL = process.env.BASE_URL
const allowedOrigin = baseURL ? new URL(baseURL).origin : undefined
const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET
const bypassHeaders = bypassSecret
  ? {
      'x-vercel-protection-bypass': bypassSecret,
      'x-vercel-set-bypass-cookie': 'true',
    }
  : {}

export const test = base.extend({
  page: async ({ page }, use) => {
    if (allowedOrigin && bypassSecret) {
      await page.route('**/*', async (route) => {
        const requestUrl = new URL(route.request().url())
        if (requestUrl.origin === allowedOrigin) {
          await route.continue({
            headers: { ...route.request().headers(), ...bypassHeaders },
          })
          return
        }
        await route.continue()
      })
    }
    await use(page)
  },
  request: async ({}, use) => {
    const context = await playwrightRequest.newContext({
      ...(baseURL ? { baseURL } : {}),
      extraHTTPHeaders: bypassHeaders,
    })
    try {
      await use(context)
    } finally {
      await context.dispose()
    }
  },
})

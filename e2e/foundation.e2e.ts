import { expect, test } from './fixtures'

test('health endpoint returns an uncached status and security headers', async ({ request }) => {
  const response = await request.get('/api/health')

  expect(response.ok()).toBe(true)
  await expect(response.json()).resolves.toEqual({ status: 'ok' })
  expect(response.headers()['cache-control']).toBe('no-store')
  expect(response.headers()['x-content-type-options']).toBe('nosniff')
  expect(response.headers()['content-security-policy']).toContain("'nonce-")
})

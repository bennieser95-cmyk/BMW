import { createHmac } from 'node:crypto'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { GET as purge } from '@/app/api/cron/purge-leads/route'
import { GET as csrf } from '@/app/api/csrf/route'
import { GET as health } from '@/app/api/health/route'
import { POST as revalidate } from '@/app/api/revalidate/route'
import { POST as price } from '@/app/api/v1/configurations/price/route'
import { POST as submitLead } from '@/app/api/v1/leads/route'
import { GET as listConfigurations } from '@/app/api/v1/me/configurations/route'
import { UnauthorizedError } from '@/domain/shared/domain-error'

const mocks = vi.hoisted(() => ({
  database: vi.fn(), claim: vi.fn(), revalidate: vi.fn(), purgeLeads: vi.fn(),
  purgeSecurity: vi.fn(), list: vi.fn(), lead: vi.fn(), rate: vi.fn(), price: vi.fn(),
}))
vi.mock('server-only', () => ({}))
vi.mock('next/cache', () => ({ revalidateTag: mocks.revalidate }))
vi.mock('@/lib/env', () => ({ env: {
  APP_BASE_URL: 'https://showroom.example.invalid', REVALIDATE_SECRET: 'synthetic-revalidation-secret',
  CRON_SECRET: 'synthetic-cron-secret', RATE_LIMIT_SECRET: 'synthetic-rate-limit-secret-32-characters',
} }))
vi.mock('@/infrastructure/logging/logger', () => ({ logger: { error: vi.fn(), warn: vi.fn() } }))
vi.mock('@/lib/backend/services', () => ({
  checkDatabase: mocks.database, catalog: { price: mocks.price }, accounts: { list: mocks.list },
  leads: { create: mocks.lead }, leadStore: { purgeExpired: mocks.purgeLeads },
  security: { claimWebhook: mocks.claim, purgeExpired: mocks.purgeSecurity, consumeRateLimit: mocks.rate },
}))

beforeEach(() => {
  vi.resetAllMocks()
  mocks.rate.mockResolvedValue({ allowed: true, retryAfterSeconds: 600 })
})
const base = 'https://showroom.example.invalid'
function webhook(body = '{"tag":"models"}', timestamp = String(Math.floor(Date.now() / 1000))) {
  const signature = createHmac('sha256', 'synthetic-revalidation-secret').update(`${timestamp}.${body}`).digest('hex')
  return new Request(`${base}/api/revalidate`, { method: 'POST', body, headers: {
    'content-type': 'application/json', 'x-revalidate-timestamp': timestamp, 'x-revalidate-signature': signature,
  } })
}
describe('BFF route integration', () => {
  it('claims a signed webhook once before invalidating and rejects replays', async () => {
    mocks.claim.mockResolvedValueOnce(true).mockResolvedValueOnce(false)
    const request = webhook()
    const duplicate = request.clone()
    expect((await revalidate(request)).status).toBe(200)
    expect(mocks.revalidate).toHaveBeenCalledWith('models', { expire: 0 })
    expect((await revalidate(duplicate)).status).toBe(409)
    expect(mocks.revalidate).toHaveBeenCalledOnce()
  })
  it('does not claim invalid signatures, malformed tags or expired webhooks', async () => {
    const invalid = webhook()
    invalid.headers.set('x-revalidate-signature', 'a'.repeat(64))
    expect((await revalidate(invalid)).status).toBe(401)
    expect((await revalidate(webhook('{"tag":"arbitrary-tag"}'))).status).toBe(422)
    expect((await revalidate(webhook('{"tag":"models"}', '1000000000'))).status).toBe(401)
    expect(mocks.claim).not.toHaveBeenCalled()
    expect(mocks.revalidate).not.toHaveBeenCalled()
  })
  it('health reports success only after a real adapter check and reports failures as 503', async () => {
    expect((await health(new Request(`${base}/api/health`))).status).toBe(200)
    expect(mocks.database).toHaveBeenCalledOnce()
    mocks.database.mockRejectedValueOnce(new Error('synthetic database failure'))
    const response = await health(new Request(`${base}/api/health`))
    expect(response.status).toBe(503)
    expect((await response.json()).traceId).toBeTruthy()
  })
  it('protects retention purge and supplies an exact 90-day cutoff', async () => {
    const now = Date.now()
    expect((await purge(new Request(`${base}/api/cron/purge-leads`))).status).toBe(401)
    expect(mocks.purgeLeads).not.toHaveBeenCalled()
    mocks.purgeLeads.mockResolvedValueOnce(3)
    const response = await purge(new Request(`${base}/api/cron/purge-leads`, {
      headers: { authorization: 'Bearer synthetic-cron-secret' },
    }))
    expect(await response.json()).toEqual({ removed: 3 })
    const cutoff = mocks.purgeLeads.mock.calls[0]?.[0]
    expect(cutoff).toBeInstanceOf(Date)
    expect(Math.abs(cutoff.getTime() - (now - 90 * 86400000))).toBeLessThan(2000)
    expect(mocks.purgeSecurity).toHaveBeenCalledOnce()
  })
  it('produces secure CSRF cookies and denies leads without the matching token', async () => {
    const tokenResponse = csrf()
    const cookie = tokenResponse.headers.get('set-cookie') ?? ''
    expect(cookie).toContain('__Host-bavaria.csrf=')
    for (const flag of ['Path=/', 'HttpOnly', 'SameSite=Strict', 'Secure']) expect(cookie).toContain(flag)
    const denied = await submitLead(new Request(`${base}/api/v1/leads`, { method: 'POST', body: '{}' }))
    expect(denied.status).toBe(403)
    expect(mocks.lead).not.toHaveBeenCalled()
  })
  it('validates price payload before dispatching and returns only server-calculated money', async () => {
    function request(payload: unknown) {
      return new Request(`${base}/api/v1/configurations/price`, {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload),
      })
    }
    expect((await price(request({ modelSlug: 'car', optionIds: [], totalPriceCents: 1 }))).status).toBe(422)
    expect(mocks.price).not.toHaveBeenCalled()
    mocks.price.mockResolvedValueOnce({ totalPriceCents: 5000000, currency: 'EUR' })
    expect(await (await price(request({ modelSlug: 'car', optionIds: [] }))).json())
      .toEqual({ totalPriceCents: 5000000, currency: 'EUR' })
  })
  it('does not downgrade an unauthorized account request to an empty success', async () => {
    mocks.list.mockRejectedValueOnce(new UnauthorizedError())
    const response = await listConfigurations(new Request(`${base}/api/v1/me/configurations`))
    expect(response.status).toBe(401)
    expect(response.headers.get('content-type')).toContain('application/problem+json')
  })
})

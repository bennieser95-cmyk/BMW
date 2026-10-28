import { describe, expect, it, vi } from 'vitest'

import { ForbiddenError } from '@/domain/shared/domain-error'
import { assertCsrf, handleRoute, HttpError, parseQuery, readBody, readJson } from '@/lib/api/http'
import { leadSchema } from '@/lib/api/lead.schema'
import { configurationSchema, modelQuerySchema, paginationSchema, priceRequestSchema } from '@/lib/api/request.schema'

vi.mock('server-only', () => ({}))
vi.mock('@/lib/env', () => ({ env: { APP_BASE_URL: 'https://showroom.example.invalid' } }))
vi.mock('@/infrastructure/logging/logger', () => ({ logger: { error: vi.fn(), warn: vi.fn() } }))

const url = 'https://showroom.example.invalid/api/v1/leads'
const contact = {
  leadType: 'contact', firstName: 'Synthetic', lastName: 'Person', email: 'test@example.invalid',
  consent: true, honeypot: '',
}
describe('strict boundary validation', () => {
  it('enforces bounded pagination, duplicate query rejection and unknown-field rejection', () => {
    expect(paginationSchema.parse({})).toEqual({ page: 1, pageSize: 20 })
    for (const value of ['0', '51', '1.2', 'NaN']) {
      expect(paginationSchema.safeParse({ pageSize: value }).success).toBe(false)
    }
    expect(() => parseQuery(new Request(`${url}?page=1&page=2`), modelQuerySchema)).toThrow(HttpError)
    expect(modelQuerySchema.safeParse({ userId: 'forged' }).success).toBe(false)
    expect(configurationSchema.safeParse({ modelSlug: 'car', name: 'x', configurationCode: 'v1.car.', userId: 'forged' }).success).toBe(false)
    expect(priceRequestSchema.safeParse({ modelSlug: 'car', optionIds: [], priceCents: 1 }).success).toBe(false)
  })
  it('requires consent, an empty honeypot and complete test-drive data', () => {
    expect(leadSchema.safeParse(contact).success).toBe(true)
    for (const change of [{ consent: false }, { honeypot: 'bot' }, { userId: 'forged' }, { leadType: 'test-drive' }, { email: 'invalid' }]) {
      expect(leadSchema.safeParse({ ...contact, ...change }).success).toBe(false)
    }
    expect(leadSchema.safeParse({ ...contact, leadType: 'test-drive', modelSlug: 'car', dealerId: 'dealer', requestedDate: '2000-01-01' }).success).toBe(false)
  })
  it('rejects wrong media types, malformed JSON and oversized streams', async () => {
    await expect(readJson(new Request(url, { method: 'POST', body: '{}' }), configurationSchema))
      .rejects.toMatchObject({ status: 415 })
    await expect(readJson(new Request(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{' }), configurationSchema))
      .rejects.toMatchObject({ status: 400 })
    await expect(readBody(new Request(url, { method: 'POST', body: 'x'.repeat(16385) })))
      .rejects.toMatchObject({ status: 413 })
  })
})

describe('CSRF and safe problem responses', () => {
  const token = 'a'.repeat(64)
  function request(overrides: Record<string, string> = {}) {
    return new Request(url, { method: 'POST', headers: {
      origin: 'https://showroom.example.invalid',
      cookie: `__Host-bavaria.csrf=${token}`, 'x-csrf-token': token, ...overrides,
    } })
  }
  it('requires origin, cookie and matching header', () => {
    expect(() => assertCsrf(request())).not.toThrow()
    for (const headers of [{ origin: 'https://evil.invalid' }, { cookie: '' }, { 'x-csrf-token': 'b'.repeat(64) }, { 'sec-fetch-site': 'cross-site' }]) {
      expect(() => assertCsrf(request(headers))).toThrow(ForbiddenError)
    }
  })
  it('returns traceable RFC 9457 without exception messages or personal data', async () => {
    const response = await handleRoute(request(), async () => { throw new Error('secret:a@example.invalid') })
    expect(response.status).toBe(503)
    expect(response.headers.get('content-type')).toContain('application/problem+json')
    expect(response.headers.get('cache-control')).toBe('no-store')
    const body = await response.json()
    expect(body.traceId).toBe(response.headers.get('x-trace-id'))
    expect(JSON.stringify(body)).not.toContain('secret')
    expect(JSON.stringify(body)).not.toContain('example.invalid')
  })
  it('preserves the rate limit status and retry interval', async () => {
    const response = await handleRoute(request(), async () => { throw new HttpError(429, 'RATE_LIMITED', 42) })
    expect(response.status).toBe(429)
    expect(response.headers.get('retry-after')).toBe('42')
  })
})

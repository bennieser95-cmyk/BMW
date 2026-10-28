import { createHmac } from 'node:crypto'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { SecurityPort } from '@/domain/security/security.port'
import { limitRequest, verifyWebhook } from '@/lib/backend/request-security'

vi.mock('server-only', () => ({}))
vi.mock('@/lib/env', () => ({ env: { RATE_LIMIT_SECRET: 'synthetic-rate-limit-secret-32-characters' } }))

const secret = 'synthetic-webhook-secret'
const now = 1800000000000
const timestamp = String(now / 1000)
const body = '{"tag":"models"}'
function sign(payload = body, time = timestamp): string {
  return createHmac('sha256', secret).update(`${time}.${payload}`).digest('hex')
}

describe('HMAC authentication', () => {
  it('accepts only the signed raw bytes and timestamp', () => {
    expect(verifyWebhook(body, timestamp, sign(), secret, now)).toBe(sign())
    expect(() => verifyWebhook(`${body} `, timestamp, sign(), secret, now)).toThrow()
    expect(() => verifyWebhook(body, String(Number(timestamp) + 1), sign(), secret, now)).toThrow()
  })
  it('rejects expired, future, malformed and missing credentials', () => {
    for (const time of [String(Number(timestamp) - 301), String(Number(timestamp) + 301), 'invalid', null]) {
      expect(() => verifyWebhook(body, time, time ? sign(body, time) : null, secret, now)).toThrow()
    }
    for (const signature of [null, '', '0'.repeat(64), sign().toUpperCase(), 'a'.repeat(10000)]) {
      expect(() => verifyWebhook(body, timestamp, signature, secret, now)).toThrow()
    }
  })
})

describe('durable rate limiter boundary', () => {
  let count: number
  const store: SecurityPort = {
    consumeRateLimit: vi.fn(async (_key, limit) => ({ allowed: ++count <= limit, retryAfterSeconds: 600 })),
    claimWebhook: vi.fn(), purgeExpired: vi.fn(),
  }
  beforeEach(() => { count = 0; vi.clearAllMocks(); vi.stubEnv('VERCEL', '0') })
  it('accepts exactly five leads and rejects the sixth without trusting spoofed IPs', async () => {
    for (let index = 0; index < 5; index++) {
      await limitRequest(new Headers({ 'x-forwarded-for': `192.0.2.${index}` }), store, 'leads')
    }
    await expect(limitRequest(new Headers(), store, 'leads')).rejects.toMatchObject({ status: 429, retryAfter: 600 })
    const calls = vi.mocked(store.consumeRateLimit).mock.calls
    expect(new Set(calls.map(([key]) => key)).size).toBe(1)
    expect(calls[0]?.[0]).toMatch(/^[a-f0-9]{64}$/)
    expect(calls[0]?.slice(1)).toEqual([5, 600])
  })
  it('fails closed on database failure', async () => {
    vi.mocked(store.consumeRateLimit).mockRejectedValueOnce(new Error('database unavailable'))
    await expect(limitRequest(new Headers(), store, 'leads')).rejects.toThrow('database unavailable')
  })
})

import 'server-only'

import { createHmac } from 'node:crypto'

import type { SecurityPort } from '@/domain/security/security.port'
import { ServiceUnavailableError } from '@/domain/shared/domain-error'
import { constantTimeEqual, HttpError } from '@/lib/api/http'
import { env } from '@/lib/env'

export async function limitRequest(headers: Headers, store: SecurityPort, scope: string): Promise<void> {
  if (!env.RATE_LIMIT_SECRET) throw new ServiceUnavailableError('RATE_LIMIT_NOT_CONFIGURED')
  // Only Vercel's overwritten forwarding header is trusted; other hosts share a conservative bucket.
  const address = process.env.VERCEL === '1' ? headers.get('x-forwarded-for')?.split(',')[0]?.trim() : 'untrusted'
  const key = createHmac('sha256', env.RATE_LIMIT_SECRET).update(`${scope}:${address ?? 'unknown'}`).digest('hex')
  const result = await store.consumeRateLimit(key, scope === 'leads' ? 5 : 30, 600)
  if (!result.allowed) throw new HttpError(429, 'RATE_LIMITED', result.retryAfterSeconds)
}

export function verifyWebhook(
  body: string, timestamp: string | null, signature: string | null, secret: string, now = Date.now(),
): string {
  if (!timestamp || !/^\d{10}$/.test(timestamp) || !signature || !/^[a-f0-9]{64}$/.test(signature)) {
    throw new HttpError(401, 'INVALID_WEBHOOK_SIGNATURE')
  }
  if (Math.abs(now - Number(timestamp) * 1000) > 300000) throw new HttpError(401, 'WEBHOOK_EXPIRED')
  const expected = createHmac('sha256', secret).update(`${timestamp}.${body}`).digest('hex')
  if (!constantTimeEqual(signature, expected)) throw new HttpError(401, 'INVALID_WEBHOOK_SIGNATURE')
  return expected
}

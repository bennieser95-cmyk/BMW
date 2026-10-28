import { ServiceUnavailableError } from '@/domain/shared/domain-error'
import { constantTimeEqual, handleRoute, HttpError, json } from '@/lib/api/http'
import { leadStore, security } from '@/lib/backend/services'
import { env } from '@/lib/env'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export function GET(request: Request): Promise<Response> {
  return handleRoute(request, async () => {
    if (!env.CRON_SECRET) throw new ServiceUnavailableError('CRON_NOT_CONFIGURED')
    if (!constantTimeEqual(request.headers.get('authorization') ?? '', `Bearer ${env.CRON_SECRET}`)) {
      throw new HttpError(401, 'INVALID_CRON_SECRET')
    }
    const removed = await leadStore.purgeExpired(new Date(Date.now() - 90 * 86400000))
    await security.purgeExpired()
    return json({ removed })
  })
}

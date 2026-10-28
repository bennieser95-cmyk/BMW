import { revalidateTag } from 'next/cache'

import { ServiceUnavailableError } from '@/domain/shared/domain-error'
import { handleRoute, HttpError, json, readBody } from '@/lib/api/http'
import { revalidationSchema } from '@/lib/api/request.schema'
import { verifyWebhook } from '@/lib/backend/request-security'
import { security } from '@/lib/backend/services'
import { env } from '@/lib/env'

export const runtime = 'nodejs'
export function POST(request: Request): Promise<Response> {
  return handleRoute(request, async () => {
    if (!env.REVALIDATE_SECRET) throw new ServiceUnavailableError('REVALIDATION_NOT_CONFIGURED')
    if (request.headers.get('content-type')?.split(';')[0]?.trim() !== 'application/json') {
      throw new HttpError(415, 'JSON_REQUIRED')
    }
    const body = await readBody(request)
    const digest = verifyWebhook(
      body,
      request.headers.get('x-revalidate-timestamp'),
      request.headers.get('x-revalidate-signature'),
      env.REVALIDATE_SECRET,
    )
    let payload: unknown
    try {
      payload = JSON.parse(body)
    } catch {
      throw new HttpError(400, 'INVALID_JSON')
    }
    const { tag } = revalidationSchema.parse(payload)
    if (!(await security.claimWebhook(digest, new Date(Date.now() + 600000))))
      throw new HttpError(409, 'WEBHOOK_REPLAY')
    revalidateTag(tag, { expire: 0 })
    return json({ revalidated: true, tag })
  })
}

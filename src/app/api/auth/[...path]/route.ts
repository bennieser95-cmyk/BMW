import { z } from 'zod'

import { ForbiddenError } from '@/domain/shared/domain-error'
import { assertOrigin, handleRoute, readBody } from '@/lib/api/http'
import { auth } from '@/lib/auth/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
type Context = { params: Promise<{ path: string[] }> }
const pathSchema = z.array(z.string().regex(/^[a-z0-9-]+$/).max(80)).min(1).max(3)

export function GET(request: Request, context: Context): Promise<Response> {
  return handleRoute(request, async () => {
    pathSchema.parse((await context.params).path)
    if (request.url.length > 8192) throw new ForbiddenError()
    return auth.handler().GET(request, context)
  })
}

export function POST(request: Request, context: Context): Promise<Response> {
  return handleRoute(request, async () => {
    const path = pathSchema.parse((await context.params).path)
    assertOrigin(request.headers)
    // Account deletion must include application data, not just the managed identity.
    if (path[0] === 'delete-user') throw new ForbiddenError()
    await readBody(request.clone())
    return auth.handler().POST(request, context)
  })
}

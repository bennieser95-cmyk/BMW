import { handleRoute, json, parseQuery } from '@/lib/api/http'
import { modelQuerySchema } from '@/lib/api/request.schema'
import { catalog } from '@/lib/backend/services'

export const runtime = 'nodejs'
export function GET(request: Request): Promise<Response> {
  return handleRoute(request, async () =>
    json(await catalog.models(parseQuery(request, modelQuerySchema))),
  )
}

import { handleRoute, json } from '@/lib/api/http'
import { slugSchema } from '@/lib/api/request.schema'
import { catalog } from '@/lib/backend/services'

export const runtime = 'nodejs'
export function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> },
): Promise<Response> {
  return handleRoute(request, async () =>
    json(await catalog.options(slugSchema.parse((await context.params).slug))),
  )
}

import { assertCsrf, handleRoute, json, parseQuery, readJson } from '@/lib/api/http'
import { configurationSchema, paginationSchema } from '@/lib/api/request.schema'
import { accounts } from '@/lib/backend/services'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export function GET(request: Request): Promise<Response> {
  return handleRoute(request, async () => {
    const { page, pageSize } = parseQuery(request, paginationSchema.strict())
    return json(await accounts.list(page, pageSize))
  })
}
export function POST(request: Request): Promise<Response> {
  return handleRoute(request, async () => {
    assertCsrf(request)
    return json(await accounts.create(await readJson(request, configurationSchema)), 201)
  })
}

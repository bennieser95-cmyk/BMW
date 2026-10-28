import { handleRoute, json, parseQuery } from '@/lib/api/http'
import { dealerQuerySchema } from '@/lib/api/request.schema'
import { cms } from '@/lib/backend/services'

export const runtime = 'nodejs'
export function GET(request: Request): Promise<Response> {
  return handleRoute(request, async () => {
    const query = parseQuery(request, dealerQuerySchema)
    const dealers = (await cms.findDealers()).filter((dealer) => !query.postalCode || dealer.postalCode === query.postalCode)
    return json({
      dealers: dealers.slice((query.page - 1) * query.pageSize, query.page * query.pageSize),
      totalCount: dealers.length, page: query.page, pageSize: query.pageSize,
    })
  })
}

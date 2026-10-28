import { handleRoute, json, readJson } from '@/lib/api/http'
import { priceRequestSchema } from '@/lib/api/request.schema'
import { catalog } from '@/lib/backend/services'

export const runtime = 'nodejs'
export function POST(request: Request): Promise<Response> {
  return handleRoute(request, async () => json(await catalog.price(await readJson(request, priceRequestSchema))))
}

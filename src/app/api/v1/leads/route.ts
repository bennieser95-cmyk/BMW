import { assertCsrf, handleRoute, json, readJson } from '@/lib/api/http'
import { leadSchema } from '@/lib/api/lead.schema'
import { limitRequest } from '@/lib/backend/request-security'
import { leads, security } from '@/lib/backend/services'

export const runtime = 'nodejs'
export function POST(request: Request): Promise<Response> {
  return handleRoute(request, async () => {
    assertCsrf(request)
    await limitRequest(request.headers, security, 'leads')
    return json(await leads.create(await readJson(request, leadSchema)), 201)
  })
}

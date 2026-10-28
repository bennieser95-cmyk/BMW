import { handleRoute, json } from '@/lib/api/http'
import { checkDatabase } from '@/lib/backend/services'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export function GET(request: Request): Promise<Response> {
  return handleRoute(request, async () => {
    await checkDatabase()
    return json({ status: 'ok', database: 'reachable' })
  })
}

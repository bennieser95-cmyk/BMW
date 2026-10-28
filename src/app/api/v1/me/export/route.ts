import { handleRoute, json } from '@/lib/api/http'
import { accounts } from '@/lib/backend/services'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export function GET(request: Request): Promise<Response> {
  return handleRoute(request, async () => json(await accounts.exportData(), 200, {
    'Content-Disposition': 'attachment; filename="bavaria-data-export.json"',
  }))
}

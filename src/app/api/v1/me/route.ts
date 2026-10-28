import { assertCsrf, handleRoute, json, readJson } from '@/lib/api/http'
import { deleteAccountSchema } from '@/lib/api/request.schema'
import { accounts } from '@/lib/backend/services'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export function DELETE(request: Request): Promise<Response> {
  return handleRoute(request, async () => {
    assertCsrf(request)
    const input = request.body ? await readJson(request, deleteAccountSchema) : {}
    await accounts.deleteAccount(input.password)
    return json({ deleted: true })
  })
}

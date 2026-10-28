import { assertCsrf, handleRoute, json, readJson } from '@/lib/api/http'
import { idSchema, renameConfigurationSchema } from '@/lib/api/request.schema'
import { accounts } from '@/lib/backend/services'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
type Context = { params: Promise<{ id: string }> }
export function GET(request: Request, context: Context): Promise<Response> {
  return handleRoute(request, async () => json(await accounts.find(idSchema.parse((await context.params).id))))
}
export function PATCH(request: Request, context: Context): Promise<Response> {
  return handleRoute(request, async () => {
    assertCsrf(request)
    const { name } = await readJson(request, renameConfigurationSchema)
    return json(await accounts.rename(idSchema.parse((await context.params).id), name))
  })
}
export function DELETE(request: Request, context: Context): Promise<Response> {
  return handleRoute(request, async () => {
    assertCsrf(request)
    await accounts.remove(idSchema.parse((await context.params).id))
    return json({ deleted: true })
  })
}

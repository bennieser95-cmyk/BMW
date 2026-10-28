import 'server-only'

import type { AccountIdentityPort, AccountRepositoryPort } from '@/domain/account/account.port'
import type { AuthPort } from '@/domain/auth/auth.port'
import type { SavedConfigurationRepositoryPort } from '@/domain/saved-configuration/saved-configuration.port'
import {
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from '@/domain/shared/domain-error'
import { configurationSchema, priceRequestSchema } from '@/lib/api/request.schema'

import type { createCatalogService } from './catalog.service'

export function createAccountService(
  auth: AuthPort,
  account: AccountRepositoryPort,
  configurations: SavedConfigurationRepositoryPort,
  identity: AccountIdentityPort,
  catalog: ReturnType<typeof createCatalogService>,
) {
  async function currentUser(checkActive = true) {
    const user = await auth.getCurrentUser()
    if (!user) throw new UnauthorizedError()
    if (!user.emailVerified && checkActive) throw new ForbiddenError('EMAIL_VERIFICATION_REQUIRED')
    if (checkActive) await account.assertActive(user.id)
    return user
  }
  return {
    async list(page: number, pageSize: number) {
      const user = await currentUser()
      const rows = await configurations.findByUserId(user.id)
      return {
        configurations: rows.slice((page - 1) * pageSize, page * pageSize),
        totalCount: rows.length,
        page,
        pageSize,
      }
    },
    async find(id: string) {
      const user = await currentUser()
      const result = await configurations.findById(id, user.id)
      if (!result) throw new NotFoundError('Configuration not found')
      return result
    },
    async create(raw: unknown) {
      const user = await currentUser()
      const input = configurationSchema.parse(raw)
      const [version, slug, selections, extra] = input.configurationCode.split('.')
      if (
        version !== 'v1' ||
        extra !== undefined ||
        slug !== input.modelSlug ||
        selections === undefined
      ) {
        throw new ValidationError('Invalid configuration code')
      }
      const optionIds = selections ? selections.split(',') : []
      await catalog.price(priceRequestSchema.parse({ modelSlug: input.modelSlug, optionIds }))
      return configurations.create({ ...input, userId: user.id })
    },
    async rename(id: string, name: string) {
      const user = await currentUser()
      const result = await configurations.rename(id, user.id, name)
      if (!result) throw new NotFoundError('Configuration not found')
      return result
    },
    async remove(id: string) {
      const user = await currentUser()
      if (!(await configurations.delete(id, user.id)))
        throw new NotFoundError('Configuration not found')
    },
    async exportData() {
      const user = await currentUser(false)
      return { user, ...(await account.exportData(user.id)) }
    },
    async deleteAccount(password?: string) {
      const user = await currentUser(false)
      // The marker prevents writes while the external identity deletion is retried.
      await account.deleteData(user.id)
      await identity.deleteCurrentUser(password)
      await account.completeDeletion(user.id)
    },
  }
}

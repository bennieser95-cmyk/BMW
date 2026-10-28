import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { AccountIdentityPort, AccountRepositoryPort } from '@/domain/account/account.port'
import type { AuthenticatedUser, AuthPort } from '@/domain/auth/auth.port'
import type { SavedConfiguration, SavedConfigurationRepositoryPort } from '@/domain/saved-configuration/saved-configuration.port'
import { ForbiddenError, NotFoundError, UnauthorizedError } from '@/domain/shared/domain-error'
import { createAccountService } from '@/lib/backend/account.service'
import type { createCatalogService } from '@/lib/backend/catalog.service'

vi.mock('server-only', () => ({}))

const userA: AuthenticatedUser = { id: 'user-a', email: 'a@example.invalid', emailVerified: true }
const own: SavedConfiguration = {
  id: 'ca482bc0-ad83-4d4a-846b-70b557ce91b4', userId: 'user-a',
  modelSlug: 'bavaria-i4', configurationCode: 'v1.bavaria-i4.', name: 'Synthetic', createdAt: new Date(0),
}
const foreign = { ...own, id: '802a23d4-f54c-40d1-9e7a-58ff02269ccc', userId: 'user-b' }
let session: AuthenticatedUser | null
let deleting: boolean
let rows: SavedConfiguration[]
const auth: AuthPort = {
  getCurrentUser: vi.fn(async () => session),
  requireUser: vi.fn(async () => { if (!session) throw new UnauthorizedError(); return session }),
}
const account: AccountRepositoryPort = {
  assertActive: vi.fn(async () => { if (deleting) throw new ForbiddenError() }),
  exportData: vi.fn(async (userId) => ({
    exportedAt: new Date(0).toISOString(), configurations: rows.filter((row) => row.userId === userId), leads: [],
  })),
  deleteData: vi.fn(async (userId) => { deleting = true; rows = rows.filter((row) => row.userId !== userId) }),
  completeDeletion: vi.fn(async () => {}),
}
const repository: SavedConfigurationRepositoryPort = {
  findByUserId: vi.fn(async (userId) => rows.filter((row) => row.userId === userId)),
  findById: vi.fn(async (id, userId) => rows.find((row) => row.id === id && row.userId === userId) ?? null),
  create: vi.fn(async (input) => ({ ...own, ...input })),
  rename: vi.fn(async (id, userId, name) => {
    const row = rows.find((candidate) => candidate.id === id && candidate.userId === userId)
    return row ? { ...row, name } : null
  }),
  delete: vi.fn(async (id, userId) => {
    const found = rows.some((row) => row.id === id && row.userId === userId)
    rows = rows.filter((row) => row.id !== id || row.userId !== userId)
    return found
  }),
}
const identity: AccountIdentityPort = { deleteCurrentUser: vi.fn(async () => {}) }
const catalog: ReturnType<typeof createCatalogService> = {
  models: vi.fn(), model: vi.fn(), options: vi.fn(), price: vi.fn(async () => ({ totalPriceCents: 5000000, currency: 'EUR' })),
}
const service = createAccountService(auth, account, repository, identity, catalog)

beforeEach(() => {
  vi.clearAllMocks()
  session = userA
  deleting = false
  rows = [{ ...own }, { ...foreign }]
})

describe('account authorization and IDOR', () => {
  it('scopes lists and exports to the session identity', async () => {
    expect((await service.list(1, 20)).configurations).toEqual([own])
    expect((await service.exportData()).configurations).toEqual([own])
    expect(repository.findByUserId).toHaveBeenCalledWith('user-a')
    expect(account.exportData).toHaveBeenCalledWith('user-a')
  })
  it('does not disclose, rename or delete another user configuration', async () => {
    await expect(service.find(foreign.id)).rejects.toBeInstanceOf(NotFoundError)
    await expect(service.rename(foreign.id, 'Attack')).rejects.toBeInstanceOf(NotFoundError)
    await expect(service.remove(foreign.id)).rejects.toBeInstanceOf(NotFoundError)
    expect(rows).toContainEqual(foreign)
    expect(repository.delete).toHaveBeenCalledWith(foreign.id, 'user-a')
  })
  it('rejects forged identities and prices before a repository write', async () => {
    const input = { name: 'Synthetic', modelSlug: own.modelSlug, configurationCode: own.configurationCode }
    await expect(service.create({ ...input, userId: 'user-b' })).rejects.toThrow()
    await expect(service.create({ ...input, totalPriceCents: 1 })).rejects.toThrow()
    expect(repository.create).not.toHaveBeenCalled()
    await service.create(input)
    expect(repository.create).toHaveBeenCalledWith({ ...input, userId: 'user-a' })
    expect(catalog.price).toHaveBeenCalledWith({ modelSlug: own.modelSlug, optionIds: [] })
  })
  it('denies guests and unverified users without touching account data', async () => {
    session = null
    await expect(service.list(1, 20)).rejects.toBeInstanceOf(UnauthorizedError)
    session = { ...userA, emailVerified: false }
    await expect(service.list(1, 20)).rejects.toBeInstanceOf(ForbiddenError)
    expect(repository.findByUserId).not.toHaveBeenCalled()
  })
})

describe('account deletion', () => {
  it('removes application data before deleting identity and completing the guard', async () => {
    await service.deleteAccount('synthetic-password')
    expect(rows).toEqual([foreign])
    expect(identity.deleteCurrentUser).toHaveBeenCalledWith('synthetic-password')
    expect(account.completeDeletion).toHaveBeenCalledWith('user-a')
    expect(vi.mocked(account.deleteData).mock.invocationCallOrder[0])
      .toBeLessThan(vi.mocked(identity.deleteCurrentUser).mock.invocationCallOrder[0] ?? 0)
    await expect(service.list(1, 20)).rejects.toBeInstanceOf(ForbiddenError)
  })
  it('fails explicitly, blocks writes and permits retry when the provider fails', async () => {
    vi.mocked(identity.deleteCurrentUser).mockRejectedValueOnce(new Error('synthetic upstream failure'))
    await expect(service.deleteAccount()).rejects.toThrow('synthetic upstream failure')
    expect(account.completeDeletion).not.toHaveBeenCalled()
    expect(rows).toEqual([foreign])
    await expect(service.create({})).rejects.toBeInstanceOf(ForbiddenError)
    await service.deleteAccount()
    expect(account.completeDeletion).toHaveBeenCalledOnce()
  })
})

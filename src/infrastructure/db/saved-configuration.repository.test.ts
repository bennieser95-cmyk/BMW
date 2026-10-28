import { PgDialect } from 'drizzle-orm/pg-core'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createConfiguration, deleteConfiguration, savedConfigurationRepository } from './saved-configuration.repository'

import type { SQL } from 'drizzle-orm'

const mocks = vi.hoisted(() => ({
  where: vi.fn(), returning: vi.fn(), limit: vi.fn(), insert: vi.fn(), values: vi.fn(),
  select: vi.fn(), from: vi.fn(), remove: vi.fn(), transaction: vi.fn(),
  lock: vi.fn(), active: vi.fn(),
}))
vi.mock('server-only', () => ({}))
vi.mock('./client', () => ({
  getDb: () => ({ select: mocks.select, delete: mocks.remove }),
  withTransaction: mocks.transaction,
}))
vi.mock('./user-lock', () => ({ lockUser: mocks.lock, assertActiveUser: mocks.active }))

const input = { userId: 'synthetic-user-a', modelSlug: 'car', name: 'Synthetic', configurationCode: 'v1.car.' }
beforeEach(() => {
  vi.resetAllMocks()
  mocks.select.mockReturnValue({ from: mocks.from })
  mocks.from.mockReturnValue({ where: mocks.where })
  mocks.remove.mockReturnValue({ where: mocks.where })
  mocks.where.mockReturnValue({ returning: mocks.returning, limit: mocks.limit })
  mocks.returning.mockResolvedValue([])
  mocks.limit.mockResolvedValue([])
  mocks.insert.mockReturnValue({ values: mocks.values })
  mocks.values.mockReturnValue({ returning: mocks.returning })
  mocks.transaction.mockImplementation(async (operation) => operation({
    select: mocks.select, insert: mocks.insert,
  }))
})

describe('repository ownership predicates', () => {
  it('parameterizes BOTH id and owner for deletion', async () => {
    expect(await deleteConfiguration('synthetic-user-a', 'synthetic-foreign-id')).toBe(false)
    const sql = new PgDialect().sqlToQuery(mocks.where.mock.calls[0]?.[0] as SQL)
    expect(sql.sql).toContain('"id" = $1')
    expect(sql.sql).toContain('"user_id" = $2')
    expect(sql.sql).toContain(' and ')
    expect(sql.params).toEqual(['synthetic-foreign-id', 'synthetic-user-a'])
    expect(sql.sql).not.toContain('synthetic-user-a')
  })
  it('parameterizes BOTH id and owner for reads', async () => {
    expect(await savedConfigurationRepository.findById('foreign-id', 'user-a')).toBeNull()
    const sql = new PgDialect().sqlToQuery(mocks.where.mock.calls[0]?.[0] as SQL)
    expect(sql.params).toEqual(['foreign-id', 'user-a'])
    expect(sql.sql).toContain(' and ')
  })
  it('checks max20 while holding the same transaction lock used for insertion', async () => {
    mocks.where.mockResolvedValueOnce([{ count: 20 }])
    await expect(createConfiguration(input)).rejects.toMatchObject({ code: 'CONFIGURATION_LIMIT' })
    expect(mocks.lock).toHaveBeenCalledWith(expect.anything(), input.userId)
    expect(mocks.active).toHaveBeenCalledWith(expect.anything(), input.userId)
    expect(mocks.insert).not.toHaveBeenCalled()
    mocks.where.mockResolvedValueOnce([{ count: 19 }])
    mocks.returning.mockResolvedValueOnce([{ ...input, id: 'synthetic-id', createdAt: new Date(0) }])
    expect(await createConfiguration(input)).toMatchObject({ userId: input.userId })
    expect(mocks.values).toHaveBeenCalledWith(input)
  })
})

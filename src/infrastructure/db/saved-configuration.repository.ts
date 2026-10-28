import 'server-only'

import { and, count, eq } from 'drizzle-orm'

import type {
  CreateSavedConfiguration,
  SavedConfiguration,
  SavedConfigurationRepositoryPort,
} from '@/domain/saved-configuration/saved-configuration.port'
import { ConflictError } from '@/domain/shared/domain-error'

import { getDb, withTransaction } from './client'
import { savedConfigurations } from './schema/saved-configuration.table'
import { assertActiveUser, lockUser } from './user-lock'

export async function findConfigurationsByUser(userId: string): Promise<SavedConfiguration[]> {
  return getDb()
    .select()
    .from(savedConfigurations)
    .where(eq(savedConfigurations.userId, userId))
    .orderBy(savedConfigurations.createdAt)
}

export async function createConfiguration(
  input: CreateSavedConfiguration,
): Promise<SavedConfiguration> {
  return withTransaction(async (transaction) => {
    await lockUser(transaction, input.userId)
    await assertActiveUser(transaction, input.userId)
    const [result] = await transaction
      .select({ count: count() })
      .from(savedConfigurations)
      .where(eq(savedConfigurations.userId, input.userId))
    if (!result || result.count >= 20)
      throw new ConflictError('Configuration limit reached', 'CONFIGURATION_LIMIT')
    const [created] = await transaction.insert(savedConfigurations).values(input).returning()
    if (!created) throw new Error('Configuration insert failed')
    return created
  })
}

export async function renameConfiguration(
  userId: string,
  id: string,
  name: string,
): Promise<SavedConfiguration | null> {
  return withTransaction(async (transaction) => {
    await lockUser(transaction, userId)
    await assertActiveUser(transaction, userId)
    const [updated] = await transaction
      .update(savedConfigurations)
      .set({ name })
      .where(and(eq(savedConfigurations.id, id), eq(savedConfigurations.userId, userId)))
      .returning()
    return updated ?? null
  })
}

export async function deleteConfiguration(userId: string, id: string): Promise<boolean> {
  const deleted = await getDb()
    .delete(savedConfigurations)
    .where(and(eq(savedConfigurations.id, id), eq(savedConfigurations.userId, userId)))
    .returning({ id: savedConfigurations.id })
  return deleted.length === 1
}

export const savedConfigurationRepository: SavedConfigurationRepositoryPort = {
  findByUserId: findConfigurationsByUser,
  async findById(id, userId) {
    const [configuration] = await getDb()
      .select()
      .from(savedConfigurations)
      .where(and(eq(savedConfigurations.id, id), eq(savedConfigurations.userId, userId)))
      .limit(1)
    return configuration ?? null
  },
  create: createConfiguration,
  rename: (id, userId, name) => renameConfiguration(userId, id, name),
  delete: (id, userId) => deleteConfiguration(userId, id),
}

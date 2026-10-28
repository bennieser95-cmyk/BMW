import 'server-only'

import { eq } from 'drizzle-orm'

import type { AccountRepositoryPort } from '@/domain/account/account.port'

import { getDb, withTransaction } from './client'
import { leads } from './schema/lead.table'
import { savedConfigurations } from './schema/saved-configuration.table'
import { accountDeletions } from './schema/security.table'
import { assertActiveUser, deletionKey, lockUser } from './user-lock'

export const accountRepository: AccountRepositoryPort = {
  async assertActive(userId) {
    await withTransaction((transaction) => assertActiveUser(transaction, userId))
  },
  async exportData(userId) {
    return withTransaction(async (transaction) => {
      await lockUser(transaction, userId)
      await assertActiveUser(transaction, userId)
      const configurations = await transaction
        .select()
        .from(savedConfigurations)
        .where(eq(savedConfigurations.userId, userId))
      const userLeads = await transaction.select().from(leads).where(eq(leads.userId, userId))
      return {
        exportedAt: new Date().toISOString(),
        configurations,
        leads: userLeads.map((lead) => ({
          id: lead.id,
          kind: lead.type,
          ...lead.contact,
          userId,
          consentAt: lead.consentAt,
          createdAt: lead.createdAt,
          ...(lead.modelSlug === null ? {} : { modelSlug: lead.modelSlug }),
          ...(lead.dealerId === null ? {} : { dealerId: lead.dealerId }),
          ...(lead.requestedDate === null ? {} : { requestedDate: lead.requestedDate }),
        })),
      }
    })
  },
  async deleteData(userId) {
    await withTransaction(async (transaction) => {
      await lockUser(transaction, userId)
      await transaction
        .insert(accountDeletions)
        .values({ userId: deletionKey(userId) })
        .onConflictDoNothing()
      await transaction.delete(savedConfigurations).where(eq(savedConfigurations.userId, userId))
      await transaction.delete(leads).where(eq(leads.userId, userId))
    })
  },
  async completeDeletion(userId) {
    await getDb()
      .update(accountDeletions)
      .set({ completedAt: new Date() })
      .where(eq(accountDeletions.userId, deletionKey(userId)))
  },
}

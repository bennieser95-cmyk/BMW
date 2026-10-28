import 'server-only'

import { lt } from 'drizzle-orm'

import type { CreateLead, LeadRepositoryPort, LeadSubmission } from '@/domain/lead/lead.port'
import { logger } from '@/infrastructure/logging/logger'

import { getDb, withTransaction } from './client'
import { leads } from './schema/lead.table'
import { assertActiveUser, lockUser } from './user-lock'

export async function createLead(input: CreateLead): Promise<LeadSubmission> {
  const values = {
    type: input.kind,
    modelSlug: input.modelSlug,
    dealerId: input.dealerId,
    requestedDate: input.requestedDate,
    userId: input.userId,
    contact: {
      firstName: input.firstName, lastName: input.lastName, email: input.email,
      ...(input.phone === undefined ? {} : { phone: input.phone }),
    },
    consentAt: input.consentAt,
    createdAt: input.createdAt,
  }
  const result = await withTransaction(async (transaction) => {
    if (input.userId) {
      await lockUser(transaction, input.userId)
      await assertActiveUser(transaction, input.userId)
    }
    const [created] = await transaction.insert(leads).values(values)
      .returning({ id: leads.id, createdAt: leads.createdAt })
    if (!created) throw new Error('Lead insert failed')
    return created
  })
  logger.info({ event: 'lead.created' }, 'Lead persisted with consent')
  return result
}

export const leadRepository: LeadRepositoryPort = {
  create: createLead,
  async purgeExpired(before) {
    const removed = await getDb().delete(leads).where(lt(leads.createdAt, before)).returning({ id: leads.id })
    logger.info({ event: 'leads.purged', count: removed.length }, 'Retention purge completed')
    return removed.length
  },
}

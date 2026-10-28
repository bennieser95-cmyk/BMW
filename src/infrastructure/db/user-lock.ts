import 'server-only'

import { createHmac } from 'node:crypto'

import { eq, sql } from 'drizzle-orm'

import { ConflictError } from '@/domain/shared/domain-error'
import { requireEnv } from '@/lib/env'

import { accountDeletions } from './schema/security.table'

import type { DatabaseTransaction } from './client'

export async function lockUser(transaction: DatabaseTransaction, userId: string): Promise<void> {
  await transaction.execute(sql`select pg_advisory_xact_lock(hashtextextended(${userId}, 0))`)
}

export function deletionKey(userId: string): string {
  return createHmac('sha256', requireEnv('RATE_LIMIT_SECRET'))
    .update(`account-deletion:${userId}`)
    .digest('hex')
}

export async function assertActiveUser(
  transaction: DatabaseTransaction,
  userId: string,
): Promise<void> {
  const [pending] = await transaction
    .select({ id: accountDeletions.id })
    .from(accountDeletions)
    .where(eq(accountDeletions.userId, deletionKey(userId)))
    .limit(1)
  if (pending) throw new ConflictError('Account deletion is pending', 'ACCOUNT_DELETION_PENDING')
}

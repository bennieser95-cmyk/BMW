import 'server-only'

import { lt, sql } from 'drizzle-orm'

import type { SecurityPort } from '@/domain/security/security.port'

import { getDb, withTransaction } from './client'
import { accountDeletions, rateLimits, webhookReceipts } from './schema/security.table'

export const securityRepository: SecurityPort = {
  async consumeRateLimit(key, limit, windowSeconds) {
    const now = new Date()
    const expiresAt = new Date(now.getTime() + windowSeconds * 1000)
    const [bucket] = await getDb().insert(rateLimits).values({ key, count: 1, expiresAt })
      .onConflictDoUpdate({
        target: rateLimits.key,
        set: {
          count: sql`case when ${rateLimits.expiresAt} <= ${now} then 1 else ${rateLimits.count} + 1 end`,
          expiresAt: sql`case when ${rateLimits.expiresAt} <= ${now} then ${expiresAt} else ${rateLimits.expiresAt} end`,
        },
      }).returning()
    if (!bucket) throw new Error('Rate limit update failed')
    return {
      allowed: bucket.count <= limit,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.expiresAt.getTime() - now.getTime()) / 1000)),
    }
  },
  async claimWebhook(digest, expiresAt) {
    const result = await getDb().insert(webhookReceipts).values({ digest, expiresAt })
      .onConflictDoNothing().returning({ id: webhookReceipts.id })
    return result.length === 1
  },
  async purgeExpired() {
    await withTransaction(async (transaction) => {
      const now = new Date()
      await transaction.delete(rateLimits).where(lt(rateLimits.expiresAt, now))
      await transaction.delete(webhookReceipts).where(lt(webhookReceipts.expiresAt, now))
      await transaction.delete(accountDeletions)
        .where(lt(accountDeletions.completedAt, new Date(now.getTime() - 86400000)))
    })
  },
}

import 'server-only'

import { index, integer, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core'

export const rateLimits = pgTable('rate_limits', {
  id: uuid('id').defaultRandom().primaryKey(),
  key: text('key').notNull(),
  count: integer('count').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  uniqueIndex('uq_rate_limits_key').on(t.key),
  index('idx_rate_limits_expires_at').on(t.expiresAt),
])

export const webhookReceipts = pgTable('webhook_receipts', {
  id: uuid('id').defaultRandom().primaryKey(),
  digest: text('digest').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  uniqueIndex('uq_webhook_receipts_digest').on(t.digest),
  index('idx_webhook_receipts_expires_at').on(t.expiresAt),
])

export const accountDeletions = pgTable('account_deletions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [uniqueIndex('uq_account_deletions_user_id').on(t.userId)])

import 'server-only'

import { sql } from 'drizzle-orm'
import { check, index, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const leads = pgTable(
  'leads',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    type: text('type', { enum: ['contact', 'test-drive'] }).notNull(),
    modelSlug: text('model_slug'),
    dealerId: text('dealer_id'),
    userId: text('user_id'),
    contact: jsonb('contact').$type<{
      firstName: string
      lastName: string
      email: string
      phone?: string
    }>().notNull(),
    requestedDate: text('requested_date'),
    consentAt: timestamp('consent_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index('idx_leads_user_id').on(t.userId),
    index('idx_leads_created_at').on(t.createdAt),
    check('chk_leads_type', sql`${t.type} in ('contact', 'test-drive')`),
  ],
)

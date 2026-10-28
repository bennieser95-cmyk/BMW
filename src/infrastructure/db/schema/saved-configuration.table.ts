import 'server-only'

import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const savedConfigurations = pgTable(
  'saved_configurations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').notNull(),
    modelSlug: text('model_slug').notNull(),
    configurationCode: text('configuration_code').notNull(),
    name: text('name').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index('idx_saved_configurations_user_id').on(t.userId)],
)

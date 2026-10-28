import 'server-only'

import { sql } from 'drizzle-orm'

import { getDb } from './client'

export async function checkDatabase(): Promise<void> {
  await getDb().execute(sql`select 1`)
}

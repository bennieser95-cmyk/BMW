import 'server-only'

import { neon, neonConfig, Pool } from '@neondatabase/serverless'
import { drizzle as httpDrizzle } from 'drizzle-orm/neon-http'
import { drizzle as poolDrizzle } from 'drizzle-orm/neon-serverless'

import { ServiceUnavailableError } from '@/domain/shared/domain-error'
import { env } from '@/lib/env'

function getConnectionString(): string {
  if (!env.DATABASE_URL) throw new ServiceUnavailableError('DATABASE_NOT_CONFIGURED')
  const url = new URL(env.DATABASE_URL)
  if (!url.hostname.includes('-pooler') || url.searchParams.get('sslmode') !== 'require') {
    throw new ServiceUnavailableError('DATABASE_REQUIRES_POOLER_TLS')
  }
  return env.DATABASE_URL
}

export function getDb(): ReturnType<typeof httpDrizzle> {
  return httpDrizzle(
    neon(getConnectionString(), { fetchOptions: { signal: AbortSignal.timeout(10000) } }),
  )
}

export type DatabaseTransaction = Parameters<
  Parameters<ReturnType<typeof poolDrizzle>['transaction']>[0]
>[0]

export async function withTransaction<T>(
  operation: (transaction: DatabaseTransaction) => Promise<T>,
): Promise<T> {
  neonConfig.webSocketConstructor = WebSocket
  const pool = new Pool({
    connectionString: getConnectionString(),
    connectionTimeoutMillis: 10000,
    query_timeout: 10000,
  })
  try {
    return await poolDrizzle(pool).transaction(operation)
  } finally {
    await pool.end()
  }
}

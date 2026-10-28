import 'server-only'

import { createNeonAuth } from '@neondatabase/auth/next/server'

import { ServiceUnavailableError } from '@/domain/shared/domain-error'
import { logger } from '@/infrastructure/logging/logger'
import { env } from '@/lib/env'

let instance: ReturnType<typeof createNeonAuth> | undefined

export function getAuth(): ReturnType<typeof createNeonAuth> {
  if (!env.NEON_AUTH_BASE_URL || !env.NEON_AUTH_COOKIE_SECRET) {
    throw new ServiceUnavailableError('AUTH_NOT_CONFIGURED')
  }
  instance ??= createNeonAuth({
    baseUrl: env.NEON_AUTH_BASE_URL,
    cookies: { secret: env.NEON_AUTH_COOKIE_SECRET, sessionDataTtl: 0, sameSite: 'lax' },
    logger: {
      error: () => logger.error({ event: 'auth.upstream.error' }, 'Authentication service failed'),
      warn: () => logger.warn({ event: 'auth.upstream.warning' }, 'Authentication service warning'),
      info: () => logger.info({ event: 'auth.upstream.info' }, 'Authentication service event'),
      debug: () => logger.debug({ event: 'auth.upstream.debug' }, 'Authentication service event'),
    },
  })
  return instance
}

export const auth = {
  handler: () => getAuth().handler(),
}

import 'server-only'
import { z } from 'zod'

const optionalUrlSchema = z.preprocess(
  (value: unknown) => (value === '' ? undefined : value),
  z.url().optional(),
)

const optionalSecretSchema = z.preprocess(
  (value: unknown) => (value === '' ? undefined : value),
  z.string().optional(),
)

const environmentSchema = z.object({
  APP_BASE_URL: z.url().default('http://localhost:3000'),
  DATABASE_URL: optionalUrlSchema,
  DATABASE_URL_UNPOOLED: optionalUrlSchema,
  NEON_AUTH_BASE_URL: optionalUrlSchema,
  NEON_AUTH_COOKIE_SECRET: z.preprocess(
    (value: unknown) => (value === '' ? undefined : value),
    z.string().min(32).optional(),
  ),
  CMS_API_URL: optionalUrlSchema,
  CMS_API_TOKEN: optionalSecretSchema,
  REVALIDATE_SECRET: optionalSecretSchema,
  CRON_SECRET: optionalSecretSchema,
  RATE_LIMIT_SECRET: z.preprocess(
    (value: unknown) => (value === '' ? undefined : value),
    z.string().min(32).optional(),
  ),
  SENTRY_DSN: optionalUrlSchema,
  NEXT_PUBLIC_DEFAULT_LOCALE: z.enum(['de-de', 'en-gb']).default('de-de'),
})

const parsedEnvironment = environmentSchema.safeParse(process.env)

if (!parsedEnvironment.success) {
  const invalidVariables = [
    ...new Set(parsedEnvironment.error.issues.map(({ path }) => path.join('.'))),
  ].join(', ')

  throw new Error(`Invalid environment variables: ${invalidVariables}`)
}

export const env = parsedEnvironment.data

export function requireEnv(
  name: 'DATABASE_URL' | 'NEON_AUTH_BASE_URL' | 'NEON_AUTH_COOKIE_SECRET' | 'REVALIDATE_SECRET' | 'CRON_SECRET' | 'RATE_LIMIT_SECRET',
): string {
  const value = env[name]
  if (!value) throw new Error(`Missing server configuration: ${name}`)
  return value
}

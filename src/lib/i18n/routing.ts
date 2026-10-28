import { env } from '@/lib/env'
import type { Locale } from '@/lib/messages'

export const locales: readonly Locale[] = ['de-de', 'en-gb']

export const defaultLocale: Locale = env.NEXT_PUBLIC_DEFAULT_LOCALE

export const routing = {
  locales,
  defaultLocale,
  localePrefix: 'always',
} as const

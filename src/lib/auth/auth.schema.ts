import { z } from 'zod'

export const authPathSchema = z.enum([
  'sign-in',
  'sign-up',
  'forgot-password',
  'reset-password',
  'verify-email',
])
export const authFormSchema = z.object({
  email: z.email().max(254),
  password: z.string().min(8).max(128),
  name: z.string().trim().min(1).max(80),
})
export const authSearchSchema = z.object({
  returnTo: z.string().max(2048).optional(),
  token: z.string().max(4096).optional(),
  error: z.string().max(100).optional(),
  locale: z.enum(['de-de', 'en-gb']).default('de-de'),
})

export function safeReturnTo(value: string | undefined, fallback = '/de-de/konto'): string {
  if (!value || !/^\/(?:de-de|en-gb)(?:\/|$)/.test(value) || /[\\\u0000-\u0020]/.test(value))
    return fallback
  const parsed = new URL(value, 'https://showroom.invalid')
  return parsed.origin === 'https://showroom.invalid'
    ? `${parsed.pathname}${parsed.search}${parsed.hash}`
    : fallback
}

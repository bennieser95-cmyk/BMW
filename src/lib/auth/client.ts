'use client'

import { createAuthClient } from '@neondatabase/auth/next'
import { z } from 'zod'

export const authClient = createAuthClient()

// The pinned beta's generated emailOtp method types are incomplete; use its typed SDK transport.
export async function sendEmailVerificationOtp(email: string) {
  const result = await authClient.$fetch<unknown>('/email-otp/send-verification-otp', {
    method: 'POST',
    body: { email: z.email().parse(email), type: 'email-verification' },
  })
  if (!result.error) z.object({ success: z.literal(true) }).parse(result.data)
  return result
}

export async function verifyEmailOtp(email: string, otp: string) {
  const result = await authClient.$fetch<unknown>('/email-otp/verify-email', {
    method: 'POST',
    body: {
      email: z.email().parse(email),
      otp: z
        .string()
        .regex(/^\d{6}$/)
        .parse(otp),
    },
  })
  if (!result.error) z.object({ status: z.literal(true) }).parse(result.data)
  return result
}

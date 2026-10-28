import 'server-only'

import { redirect } from 'next/navigation'
import { z } from 'zod'

import type { AccountIdentityPort } from '@/domain/account/account.port'
import type { AuthenticatedUser, AuthPort } from '@/domain/auth/auth.port'
import { ForbiddenError, ServiceUnavailableError, UnauthorizedError } from '@/domain/shared/domain-error'
import { safeReturnTo } from '@/lib/auth/auth.schema'
import { getAuth } from '@/lib/auth/server'

const userSchema = z.object({
  id: z.string().min(1).max(256),
  email: z.email(),
  name: z.string().nullish(),
  emailVerified: z.boolean(),
})

export function createAuthPort(
  loadUser: () => Promise<AuthenticatedUser | null>,
  redirectTo: (url: string) => never,
  returnTo = '/de-de/konto',
): AuthPort {
  return {
    getCurrentUser: loadUser,
    async requireUser() {
      const user = await loadUser()
      const target = encodeURIComponent(safeReturnTo(returnTo))
      if (!user) return redirectTo(`/auth/sign-in?returnTo=${target}`)
      if (!user.emailVerified) return redirectTo(`/auth/verify-email?returnTo=${target}`)
      return user
    },
  }
}

async function loadCurrentUser(): Promise<AuthenticatedUser | null> {
  const result = await getAuth().getSession({ query: { disableCookieCache: true } })
  if (result.error) {
    if (result.error.status === 401) return null
    throw new ServiceUnavailableError('AUTH_UPSTREAM_ERROR')
  }
  if (!result.data?.user) return null
  const parsed = userSchema.safeParse(result.data.user)
  if (!parsed.success) throw new ServiceUnavailableError('INVALID_AUTH_RESPONSE')
  return {
    id: parsed.data.id, email: parsed.data.email, emailVerified: parsed.data.emailVerified,
    ...(parsed.data.name ? { name: parsed.data.name } : {}),
  }
}

export const neonAuthAdapter = createAuthPort(loadCurrentUser, redirect)
export const getCurrentUser = neonAuthAdapter.getCurrentUser
export async function requireUser(returnTo = '/de-de/konto'): Promise<AuthenticatedUser> {
  return createAuthPort(loadCurrentUser, redirect, returnTo).requireUser()
}

export const neonAccountIdentity: AccountIdentityPort = {
  async deleteCurrentUser(password) {
    const result = await getAuth().deleteUser(password === undefined ? {} : { password })
    if (result.error) {
      if (result.error.status === 401) throw new UnauthorizedError()
      if (result.error.status === 400 || result.error.status === 403) throw new ForbiddenError('REAUTHENTICATION_REQUIRED')
      throw new ServiceUnavailableError('AUTH_DELETION_FAILED')
    }
    if (!result.data?.success) throw new ServiceUnavailableError('AUTH_DELETION_NOT_COMPLETED')
  },
}

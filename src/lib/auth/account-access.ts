import 'server-only'

import type { AuthenticatedUser } from '@/domain/auth/auth.port'
import { neonAuthAdapter, requireUser } from '@/infrastructure/auth/neon-auth.adapter'
import { accountRepository } from '@/infrastructure/db/account.repository'

export { neonAuthAdapter }
export async function requireAccountUser(returnTo: string): Promise<AuthenticatedUser> {
  const user = await requireUser(returnTo)
  await accountRepository.assertActive(user.id)
  return user
}

import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { AuthenticatedUser, AuthPort } from '@/domain/auth/auth.port'
import { ForbiddenError, ServiceUnavailableError } from '@/domain/shared/domain-error'
import { createAuthPort, neonAccountIdentity, neonAuthAdapter } from '@/infrastructure/auth/neon-auth.adapter'

const provider = vi.hoisted(() => ({ session: vi.fn(), delete: vi.fn() }))
vi.mock('server-only', () => ({}))
vi.mock('@/lib/auth/server', () => ({ getAuth: () => ({ getSession: provider.session, deleteUser: provider.delete }) }))
vi.mock('next/navigation', () => ({ redirect: vi.fn() }))
beforeEach(() => vi.resetAllMocks())

const verified: AuthenticatedUser = { id: 'synthetic-a', email: 'a@example.invalid', emailVerified: true }
function redirect(url: string): never { throw new Error(`redirect:${url}`) }

describe('AuthPort contract (Neon / replacement provider)', () => {
  it('returns null for guests without redirecting from getCurrentUser', async () => {
    const port: AuthPort = createAuthPort(async () => null, redirect)
    expect(await port.getCurrentUser()).toBeNull()
    await expect(port.requireUser()).rejects.toThrow('redirect:/auth/sign-in?returnTo=%2Fde-de%2Fkonto')
  })

  describe('Neon provider boundary', () => {
    it('validates identity and bypasses cached session data', async () => {
      provider.session.mockResolvedValueOnce({ data: { user: verified }, error: null })
      expect(await neonAuthAdapter.getCurrentUser()).toEqual(verified)
      expect(provider.session).toHaveBeenCalledWith({ query: { disableCookieCache: true } })
    })
    it('distinguishes guests, malformed responses and upstream outages', async () => {
      provider.session.mockResolvedValueOnce({ data: null, error: null })
      expect(await neonAuthAdapter.getCurrentUser()).toBeNull()
      provider.session.mockResolvedValueOnce({ data: null, error: { status: 401 } })
      expect(await neonAuthAdapter.getCurrentUser()).toBeNull()
      for (const result of [{ data: {}, error: null }, { data: { user: { id: 'invalid' } }, error: null }, { data: null, error: { status: 503 } }]) {
        provider.session.mockResolvedValueOnce(result)
        await expect(neonAuthAdapter.getCurrentUser()).rejects.toBeInstanceOf(ServiceUnavailableError)
      }
    })
    it('requires explicit provider success for identity deletion', async () => {
      provider.delete.mockResolvedValueOnce({ data: { success: true }, error: null })
      await neonAccountIdentity.deleteCurrentUser('synthetic-password')
      expect(provider.delete).toHaveBeenCalledWith({ password: 'synthetic-password' })
      provider.delete.mockResolvedValueOnce({ data: { success: false }, error: null })
      await expect(neonAccountIdentity.deleteCurrentUser()).rejects.toBeInstanceOf(ServiceUnavailableError)
      provider.delete.mockResolvedValueOnce({ data: null, error: { status: 403 } })
      await expect(neonAccountIdentity.deleteCurrentUser()).rejects.toBeInstanceOf(ForbiddenError)
    })
  })
  it('preserves authenticated identity and redirects only unverified accounts', async () => {
    const port: AuthPort = createAuthPort(async () => verified, redirect, '/en-gb/konto')
    expect(await port.getCurrentUser()).toEqual(verified)
    expect(await port.requireUser()).toEqual(verified)
    const unverified = createAuthPort(async () => ({ ...verified, emailVerified: false }), redirect)
    await expect(unverified.requireUser()).rejects.toThrow('redirect:/auth/verify-email?returnTo=')
  })
  it('never redirects to an attacker-controlled origin', async () => {
    for (const target of ['https://evil.invalid', '//evil.invalid', '/\\evil.invalid', '/de-de\\evil']) {
      await expect(createAuthPort(async () => null, redirect, target).requireUser())
        .rejects.toThrow('returnTo=%2Fde-de%2Fkonto')
    }
  })
  it('propagates provider failures rather than downgrading to a guest session', async () => {
    const port = createAuthPort(async () => { throw new Error('provider unavailable') }, redirect)
    await expect(port.getCurrentUser()).rejects.toThrow('provider unavailable')
    await expect(port.requireUser()).rejects.toThrow('provider unavailable')
  })
})

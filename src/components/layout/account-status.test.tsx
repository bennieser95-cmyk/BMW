import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AccountStatus } from './account-status'

const useSession = vi.hoisted(() => vi.fn())
vi.mock('@/lib/auth/client', () => ({ authClient: { useSession } }))

const labels = {
  signIn: 'Anmelden',
  account: 'Mein Konto',
  loading: 'Kontostatus wird geladen',
  unavailable: 'Anmeldestatus momentan nicht verfügbar',
}

describe('AccountStatus', () => {
  beforeEach(() => useSession.mockReset())

  it.each([null, { user: { id: 'u1' } }])(
    'should show only a safe unavailable status when the session request fails with cached data %j',
    async (data) => {
      useSession.mockReturnValue({
        data,
        isPending: false,
        error: { message: 'Internal session request failed', status: 503 },
      })
      const { container } = render(<AccountStatus locale="de-de" labels={labels} />)
      expect(screen.getByRole('status')).toHaveTextContent(labels.unavailable)
      expect(screen.queryByRole('link')).not.toBeInTheDocument()
      expect(container).not.toHaveTextContent('Internal session request failed')
      expect(await axe(container)).toHaveNoViolations()
    },
  )

  it('should show a skeleton status when the session is pending', async () => {
    useSession.mockReturnValue({ data: null, isPending: true })
    const { container } = render(<AccountStatus locale="de-de" labels={labels} />)
    expect(screen.getByRole('status')).toHaveTextContent('Kontostatus wird geladen')
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(await axe(container)).toHaveNoViolations()
  })

  it('should link to sign-in with a returnTo when the visitor is a guest', () => {
    useSession.mockReturnValue({ data: null, isPending: false })
    render(<AccountStatus locale="de-de" labels={labels} />)
    expect(screen.getByRole('link', { name: 'Anmelden' })).toHaveAttribute(
      'href',
      '/auth/sign-in?returnTo=%2Fde-de%2Fkonto',
    )
  })

  it('should link to the account page when a session exists', async () => {
    useSession.mockReturnValue({ data: { user: { id: 'u1' } }, isPending: false })
    const { container } = render(<AccountStatus locale="en-gb" labels={labels} />)
    expect(screen.getByRole('link', { name: 'Mein Konto' })).toHaveAttribute('href', '/en-gb/konto')
    expect(await axe(container)).toHaveNoViolations()
  })
})

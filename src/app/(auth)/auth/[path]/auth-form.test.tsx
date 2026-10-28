import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthForm } from './auth-form'

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
  signIn: vi.fn(),
  signUp: vi.fn(),
  resetRequest: vi.fn(),
  reset: vi.fn(),
  sendOtp: vi.fn(),
  verifyOtp: vi.fn(),
}))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.push, refresh: mocks.refresh }),
}))
vi.mock('@/lib/auth/client', () => ({
  authClient: {
    signIn: { email: mocks.signIn },
    signUp: { email: mocks.signUp },
    requestPasswordReset: mocks.resetRequest,
    resetPassword: mocks.reset,
  },
  sendEmailVerificationOtp: mocks.sendOtp,
  verifyEmailOtp: mocks.verifyOtp,
}))
beforeEach(() => vi.resetAllMocks())
const props = {
  locale: 'de-de',
  returnTo: '/de-de/konto',
  token: undefined,
  hasError: false,
} as const

describe('auth forms with design-system controls', () => {
  it('signs in and returns to the validated account target', async () => {
    mocks.signIn.mockResolvedValueOnce({ data: {}, error: null })
    render(<AuthForm {...props} path="sign-in" />)
    await userEvent.type(
      screen.getByLabelText('E-Mail-Adresse', { exact: false }),
      'synthetic@example.invalid',
    )
    await userEvent.type(screen.getByLabelText(/^Passwort/), 'synthetic-password')
    await userEvent.click(screen.getByRole('button', { name: 'Fortfahren' }))
    await waitFor(() => expect(mocks.push).toHaveBeenCalledWith('/de-de/konto'))
    expect(mocks.refresh).toHaveBeenCalledOnce()
  })
  it('directs a new account to OTP verification without assuming email delivery', async () => {
    mocks.signUp.mockResolvedValueOnce({ data: {}, error: null })
    render(<AuthForm {...props} path="sign-up" />)
    await userEvent.type(screen.getByLabelText(/^Name/), 'Synthetic Person')
    await userEvent.type(screen.getByLabelText(/^E-Mail-Adresse/), 'synthetic@example.invalid')
    await userEvent.type(screen.getByLabelText(/^Passwort/), 'synthetic-password')
    await userEvent.click(screen.getByRole('button', { name: 'Fortfahren' }))
    await waitFor(() =>
      expect(mocks.push).toHaveBeenCalledWith(
        '/auth/verify-email?locale=de-de&returnTo=%2Fde-de%2Fkonto',
      ),
    )
    expect(mocks.sendOtp).not.toHaveBeenCalled()
  })
  it('sends and verifies a six-digit email OTP before entering the account', async () => {
    mocks.sendOtp.mockResolvedValueOnce({ data: { success: true }, error: null })
    mocks.verifyOtp.mockResolvedValueOnce({ data: { status: true }, error: null })
    render(<AuthForm {...props} path="verify-email" />)
    await userEvent.type(screen.getByLabelText(/^E-Mail-Adresse/), 'synthetic@example.invalid')
    await userEvent.click(screen.getByRole('button', { name: 'Fortfahren' }))
    const otp = await screen.findByLabelText(/^Bestätigungscode/)
    expect(mocks.sendOtp).toHaveBeenCalledWith('synthetic@example.invalid')
    await userEvent.type(otp, '123456')
    await userEvent.click(screen.getByRole('button', { name: 'Fortfahren' }))
    await waitFor(() =>
      expect(mocks.verifyOtp).toHaveBeenCalledWith('synthetic@example.invalid', '123456'),
    )
    expect(mocks.push).toHaveBeenCalledWith('/de-de/konto')
  })
  it('does not reset a password without a valid reset token', async () => {
    render(<AuthForm {...props} path="reset-password" />)
    await userEvent.type(screen.getByLabelText(/^Passwort/), 'synthetic-password')
    await userEvent.click(screen.getByRole('button', { name: 'Fortfahren' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('gültiger')
    expect(mocks.reset).not.toHaveBeenCalled()
  })
  it('shows a localized generic provider error without exposing upstream details', async () => {
    mocks.resetRequest.mockResolvedValueOnce({
      data: null,
      error: { message: 'secret-provider-detail' },
    })
    render(<AuthForm {...props} path="forgot-password" />)
    await userEvent.type(screen.getByLabelText(/^E-Mail-Adresse/), 'synthetic@example.invalid')
    await userEvent.click(screen.getByRole('button', { name: 'Fortfahren' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Die Anfrage konnte nicht abgeschlossen werden',
    )
    expect(screen.queryByText('secret-provider-detail')).not.toBeInTheDocument()
  })
})

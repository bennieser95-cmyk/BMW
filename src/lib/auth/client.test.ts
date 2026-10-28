import { beforeEach, describe, expect, it, vi } from 'vitest'

import { sendEmailVerificationOtp, verifyEmailOtp } from './client'

const transport = vi.hoisted(() => vi.fn())
vi.mock('@neondatabase/auth/next', () => ({ createAuthClient: () => ({ $fetch: transport }) }))
beforeEach(() => vi.resetAllMocks())

describe('pinned Neon beta OTP transport compatibility', () => {
  it('uses the SDK transport and validates the successful OTP-send response', async () => {
    transport.mockResolvedValueOnce({ data: { success: true }, error: null })
    await sendEmailVerificationOtp('synthetic@example.invalid')
    expect(transport).toHaveBeenCalledWith('/email-otp/send-verification-otp', {
      method: 'POST',
      body: { email: 'synthetic@example.invalid', type: 'email-verification' },
    })
  })
  it('validates OTPs and only accepts a verified provider response', async () => {
    await expect(verifyEmailOtp('synthetic@example.invalid', 'invalid')).rejects.toThrow()
    expect(transport).not.toHaveBeenCalled()
    transport.mockResolvedValueOnce({ data: { status: true }, error: null })
    await verifyEmailOtp('synthetic@example.invalid', '123456')
    expect(transport).toHaveBeenCalledWith('/email-otp/verify-email', {
      method: 'POST',
      body: { email: 'synthetic@example.invalid', otp: '123456' },
    })
    transport.mockResolvedValueOnce({ data: { status: false }, error: null })
    await expect(verifyEmailOtp('synthetic@example.invalid', '123456')).rejects.toThrow()
  })
  it('preserves explicit provider failures without reporting success', async () => {
    const failure = { data: null, error: { status: 429, message: 'synthetic test' } }
    transport.mockResolvedValueOnce(failure)
    expect(await sendEmailVerificationOtp('synthetic@example.invalid')).toEqual(failure)
    transport.mockResolvedValueOnce({ data: {}, error: null })
    await expect(sendEmailVerificationOtp('synthetic@example.invalid')).rejects.toThrow()
  })
})

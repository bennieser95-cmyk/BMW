'use client'

import Link from 'next/link'
import { useState } from 'react'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { authFormSchema } from '@/lib/auth/auth.schema'
import { authClient } from '@/lib/auth/client'
import de from '@/messages/auth-de.json'
import en from '@/messages/auth-en.json'

import type { FormEvent, ReactNode } from 'react'

export function AuthForm({
  path, locale, returnTo, token, hasError,
}: {
  path: 'sign-in' | 'sign-up' | 'forgot-password' | 'reset-password' | 'verify-email'
  locale: 'de-de' | 'en-gb'
  returnTo: string
  token: string | undefined
  hasError: boolean
}): ReactNode {
  const messages = locale === 'en-gb' ? en : de
  const [pending, setPending] = useState(false)
  const [error, setError] = useState(hasError ? messages.invalid : '')
  const [notice, setNotice] = useState('')
  const needsEmail = path !== 'reset-password'
  const needsPassword = path === 'sign-in' || path === 'sign-up' || path === 'reset-password'

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setError('')
    setNotice('')
    const data = Object.fromEntries(new FormData(event.currentTarget))
    const schema = z.object({
      ...(needsEmail ? { email: authFormSchema.shape.email } : {}),
      ...(needsPassword ? { password: authFormSchema.shape.password } : {}),
      ...(path === 'sign-up' ? { name: authFormSchema.shape.name } : {}),
    })
    if (!schema.safeParse(data).success || (path === 'reset-password' && !token)) {
      setError(messages.invalid)
      return
    }
    const email = String(data.email ?? '')
    const password = String(data.password ?? '')
    const callbackURL = new URL(returnTo, window.location.origin).href
    setPending(true)
    try {
      const result = path === 'sign-in' ? await authClient.signIn.email({ email, password, callbackURL })
        : path === 'sign-up' ? await authClient.signUp.email({ email, password, name: String(data.name), callbackURL })
          : path === 'forgot-password' ? await authClient.requestPasswordReset({
            email, redirectTo: `${window.location.origin}/auth/reset-password?locale=${locale}&returnTo=${encodeURIComponent(returnTo)}`,
          })
            : path === 'reset-password' ? await authClient.resetPassword({ newPassword: password, token: token ?? '' })
              : await authClient.sendVerificationEmail({ email, callbackURL })
      if (result.error) {
        setError(messages.error)
        return
      }
      if (path === 'sign-in' || path === 'reset-password') {
        window.location.assign(path === 'reset-password' ? `/auth/sign-in?locale=${locale}&returnTo=${encodeURIComponent(returnTo)}` : returnTo)
      } else if (path === 'sign-up') {
        const verification = await authClient.sendVerificationEmail({ email, callbackURL })
        if (verification.error) setError(messages.error)
        else setNotice(messages.verification)
      } else {
        setNotice(messages.success)
      }
    } catch {
      setError(messages.error)
    } finally {
      setPending(false)
    }
  }

  return <main className="page-error" lang={locale}>
    <h1>{messages[path]}</h1>
    <form className="form-shell" onSubmit={(event) => void handleSubmit(event)}>
      {error && <p role="alert">{error}</p>}
      {notice && <p role="status">{notice}</p>}
      {path === 'sign-up' && <label className="field">{messages.name}
        <input autoComplete="name" maxLength={80} name="name" required />
      </label>}
      {needsEmail && <label className="field">{messages.email}
        <input autoComplete="email" maxLength={254} name="email" required type="email" />
      </label>}
      {needsPassword && <label className="field">{messages.password}
        <input aria-describedby="password-hint" autoComplete={path === 'sign-in' ? 'current-password' : 'new-password'}
          maxLength={128} minLength={8} name="password" required type="password" />
        <span id="password-hint">{messages.passwordHint}</span>
      </label>}
      <Button loading={pending} loadingLabel={messages.pending} type="submit">{messages.submit}</Button>
    </form>
    <nav aria-label={messages['sign-in']}>
      {(['sign-in', 'sign-up', 'forgot-password', 'verify-email'] as const).filter((value) => value !== path).map((value) =>
        <p key={value}><Link href={`/auth/${value}?locale=${locale}&returnTo=${encodeURIComponent(returnTo)}`}>{messages[value]}</Link></p>,
      )}
      <p><Link href={returnTo}>{messages.continue}</Link></p>
      <p><Link href={`/${locale}`}>{messages.home}</Link></p>
    </nav>
  </main>
}

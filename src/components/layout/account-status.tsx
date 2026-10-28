'use client'

import NextLink from 'next/link'

import { Icon } from '@/components/ui/icon'
import { Skeleton } from '@/components/ui/skeleton'
import { authClient } from '@/lib/auth/client'
import { cn } from '@/lib/cn'

export interface AccountStatusProps {
  locale: string
  labels: { signIn: string; account: string; loading: string; unavailable: string }
  className?: string
}

const linkClasses =
  'inline-flex min-h-touch items-center gap-2 px-2 text-sm font-medium hover:underline'

/**
 * Header account entry. Reads the session only on the client so marketing pages stay static
 * (the header must never read cookies on the server). Shows a skeleton until the session is
 * known to avoid a guest/user flash.
 */
export function AccountStatus({ locale, labels, className }: AccountStatusProps) {
  const { data, isPending, error } = authClient.useSession()
  const accountPath = `/${locale}/konto`

  if (error) {
    return (
      <span
        className={cn('min-h-touch inline-flex items-center gap-2 px-2 text-sm', className)}
        role="status"
      >
        <Icon name="user" size="sm" />
        {labels.unavailable}
      </span>
    )
  }

  if (isPending) {
    return (
      <span className={cn('min-h-touch inline-flex items-center', className)} role="status">
        <Skeleton className="h-6 w-16" />
        <span className="sr-only">{labels.loading}</span>
      </span>
    )
  }

  if (!data) {
    const signInHref = `/auth/sign-in?returnTo=${encodeURIComponent(accountPath)}`
    return (
      <NextLink href={signInHref} className={cn(linkClasses, className)}>
        <Icon name="user" size="sm" />
        {labels.signIn}
      </NextLink>
    )
  }

  return (
    <NextLink href={accountPath} className={cn(linkClasses, className)}>
      <Icon name="user" size="sm" />
      {labels.account}
    </NextLink>
  )
}

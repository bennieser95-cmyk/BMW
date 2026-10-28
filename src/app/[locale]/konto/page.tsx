import { redirect } from 'next/navigation'

import { getMessages } from '@/lib/messages'

import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return { title: getMessages(locale).account.title, robots: { index: false, follow: false } }
}

export default async function AccountPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ returnTo?: string; cfg?: string; model?: string }>
}) {
  const [{ locale }, query] = await Promise.all([params, searchParams])
  const returnTo =
    query.returnTo ??
    `/${locale}/konto?model=${encodeURIComponent(query.model ?? 'aurelia')}&cfg=${encodeURIComponent(query.cfg ?? '')}`
  redirect(`/auth/sign-in?returnTo=${encodeURIComponent(returnTo)}`)
}

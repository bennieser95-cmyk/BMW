import { requireAccountUser } from '@/lib/auth/account-access'

import type { ReactNode } from 'react'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export default async function AccountLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}): Promise<ReactNode> {
  const { locale } = await params
  await requireAccountUser(`/${locale}/konto`)
  return children
}

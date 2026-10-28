import { notFound } from 'next/navigation'

import { authPathSchema, authSearchSchema, safeReturnTo } from '@/lib/auth/auth.schema'

import { AuthForm } from './auth-form'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export default async function AuthPage({
  params,
  searchParams,
}: {
  params: Promise<{ path: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}): Promise<React.ReactNode> {
  const parsedPath = authPathSchema.safeParse((await params).path)
  const query = authSearchSchema.safeParse(await searchParams)
  if (!parsedPath.success || !query.success) notFound()
  return (
    <AuthForm
      path={parsedPath.data}
      locale={query.data.locale}
      returnTo={safeReturnTo(query.data.returnTo, `/${query.data.locale}/konto`)}
      token={query.data.token}
      hasError={Boolean(query.data.error)}
    />
  )
}

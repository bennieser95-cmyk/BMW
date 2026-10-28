import { Breadcrumbs } from '@/components/breadcrumbs'
import { LeadForm } from '@/components/lead-form'
import { getMessages } from '@/lib/messages'

import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return { title: getMessages(locale).leads.testDriveTitle }
}

export default async function TestDrivePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ model?: string }>
}) {
  const [{ locale }, query] = await Promise.all([params, searchParams])
  const messages = getMessages(locale)
  return (
    <>
      <Breadcrumbs items={[{ label: messages.navigation.testDrive }]} locale={locale} />
      <header className="page-title page-container">
        <p className="eyebrow">BAVARIA / SERVICE</p>
        <h1>{messages.leads.testDriveTitle}</h1>
      </header>
      <LeadForm leadType="test-drive" locale={locale} modelSlug={query.model} />
    </>
  )
}

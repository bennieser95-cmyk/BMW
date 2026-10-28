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
  return { title: getMessages(locale).leads.contactTitle }
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const messages = getMessages(locale)
  return (
    <>
      <Breadcrumbs items={[{ label: messages.navigation.contact }]} locale={locale} />
      <header className="page-title page-container">
        <p className="eyebrow">BAVARIA / SERVICE</p>
        <h1>{messages.leads.contactTitle}</h1>
      </header>
      <LeadForm leadType="contact" locale={locale} modelSlug={undefined} />
    </>
  )
}

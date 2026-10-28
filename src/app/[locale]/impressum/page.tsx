import { Breadcrumbs } from '@/components/breadcrumbs'
import { getMessages } from '@/lib/messages'

import type { Metadata } from 'next'

export const revalidate = 3600

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return { title: getMessages(locale).legal.imprint }
}

export default async function ImprintPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const messages = getMessages(locale)
  return (
    <>
      <Breadcrumbs items={[{ label: messages.legal.imprint }]} locale={locale} />
      <article className="page-container section">
        <p className="eyebrow">BAVARIA / LEGAL</p>
        <h1>{messages.legal.imprint}</h1>
        <p>
          Dieses Impressum ist ein Platzhalter für die synthetische Showroom-Demo. Vor
          Veröffentlichung müssen Anbieterkennzeichnung, Vertretungsberechtigte und Kontaktangaben
          ergänzt und rechtlich geprüft werden.
        </p>
      </article>
    </>
  )
}

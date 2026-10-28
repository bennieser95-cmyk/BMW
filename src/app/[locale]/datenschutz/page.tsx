import { Breadcrumbs } from '@/components/breadcrumbs'
import { getMessages } from '@/lib/messages'

import type { Metadata } from 'next'

export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return { title: getMessages(locale).legal.privacy }
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const messages = getMessages(locale)
  return <><Breadcrumbs items={[{ label: messages.legal.privacy }]} locale={locale} /><article className="page-container section"><p className="eyebrow">BAVARIA / LEGAL</p><h1>{messages.legal.privacy}</h1><p>Diese Datenschutzseite ist ein ausdrücklich gekennzeichneter Platzhalter. Vor Produktivbetrieb sind Verantwortliche, Zwecke, Rechtsgrundlagen, Empfänger, Speicherfristen und Betroffenenrechte vollständig einzusetzen und juristisch zu prüfen.</p></article></>
}

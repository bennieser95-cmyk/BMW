import Link from 'next/link'

import { getMessages } from '@/lib/messages'

import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return { title: getMessages(locale).leads.success }
}

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const messages = getMessages(locale)
  return (
    <section className="page-error">
      <p className="eyebrow">BAVARIA / SERVICE</p>
      <h1>{messages.leads.success}</h1>
      <p>{messages.leads.success}</p>
      <Link className="button button-primary" href={`/${locale}`}>
        {messages.common.home}
      </Link>
    </section>
  )
}

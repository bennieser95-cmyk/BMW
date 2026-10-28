import { Breadcrumbs } from '@/components/breadcrumbs'
import { DealerResults } from '@/components/dealer-results'
import { DealerSearchForm } from '@/components/dealer-search-form'
import { findDealers } from '@/features/dealers/mock-dealers.queries'
import { getMessages } from '@/lib/messages'

import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return { title: getMessages(locale).dealers.title }
}

export default async function DealersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ q?: string }>
}) {
  const [{ locale }, query] = await Promise.all([params, searchParams])
  const messages = getMessages(locale)
  const dealers = await findDealers(query.q ?? '')
  return <>
    <Breadcrumbs items={[{ label: messages.navigation.dealers }]} locale={locale} />
    <header className="page-title page-container"><p className="eyebrow">BAVARIA / SERVICE</p><h1>{messages.dealers.title}</h1></header>
    <DealerSearchForm locale={locale} query={query.q} />
    <div className="page-container"><DealerResults dealers={dealers} locale={locale} /></div>
  </>
}

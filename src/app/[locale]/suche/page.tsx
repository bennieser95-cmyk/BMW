import { Breadcrumbs } from '@/components/breadcrumbs'
import { SearchBox } from '@/components/search-box'
import { getMessages } from '@/lib/messages'
import { getModels } from '@/lib/models.queries'

import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return { title: getMessages(locale).search.title }
}

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ q?: string }>
}) {
  const [{ locale }, query, models] = await Promise.all([params, searchParams, getModels()])
  const messages = getMessages(locale)
  return <>
    <Breadcrumbs items={[{ label: messages.search.title }]} locale={locale} />
    <header className="page-title page-container"><p className="eyebrow">BAVARIA / SEARCH</p><h1>{messages.search.title}</h1></header>
    <section className="form-shell"><SearchBox initialQuery={query.q ?? ''} locale={locale} models={models} /></section>
  </>
}

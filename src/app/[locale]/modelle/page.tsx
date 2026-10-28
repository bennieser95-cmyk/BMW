import { Breadcrumbs } from '@/components/breadcrumbs'
import { ModelFilter } from '@/components/model-filter'
import { getMessages } from '@/lib/messages'
import { getModels } from '@/lib/models.queries'

import type { Metadata } from 'next'

export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const messages = getMessages(locale)
  return { title: messages.models.title, description: messages.models.description }
}

export default async function ModelsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const messages = getMessages(locale)
  const models = await getModels()
  return (
    <>
      <Breadcrumbs items={[{ label: messages.navigation.models }]} locale={locale} />
      <header className="page-title page-container"><p className="eyebrow">BAVARIA / MODELLE</p><h1>{messages.models.title}</h1><p>{messages.models.description}</p></header>
      <ModelFilter locale={locale} models={models} />
    </>
  )
}

import Link from 'next/link'

import { Breadcrumbs } from '@/components/breadcrumbs'
import { ModelCarousel } from '@/components/model-carousel'
import { getMessages } from '@/lib/messages'
import { getModels } from '@/lib/models.queries'

import type { Metadata } from 'next'

export const revalidate = 3600

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return { title: getMessages(locale).home.electric }
}

export default async function ElectricPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const messages = getMessages(locale)
  const models = (await getModels()).filter(({ fuelType }) => fuelType === 'electric')
  return (
    <>
      <Breadcrumbs items={[{ label: messages.navigation.electric }]} locale={locale} />
      <header className="page-title page-container">
        <p className="eyebrow">BAVARIA / ELECTRIC</p>
        <h1>{messages.home.electric}</h1>
        <p>{messages.home.subtitle}</p>
        <Link
          className="button button-primary"
          href={`/${locale}/modelle?antrieb=${locale === 'de-de' ? 'elektro' : 'electric'}`}
        >
          {messages.home.cta}
        </Link>
      </header>
      <section className="section page-container">
        <ModelCarousel locale={locale} models={models} />
      </section>
    </>
  )
}

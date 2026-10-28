import { notFound } from 'next/navigation'

import { Breadcrumbs } from '@/components/breadcrumbs'
import { ConfiguratorWizard } from '@/components/configurator-wizard'
import { getMessages } from '@/lib/messages'
import { getModelBySlug, getModels } from '@/lib/models.queries'

import type { Metadata } from 'next'

export const revalidate = 3600

export async function generateStaticParams() {
  return (await getModels()).map(({ slug }) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const model = await getModelBySlug(slug)
  return model ? { title: `${getMessages(locale).configurator.title} ${model.name}` } : {}
}

export default async function ConfiguratorPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const [model, messages] = await Promise.all([
    getModelBySlug(slug),
    Promise.resolve(getMessages(locale)),
  ])
  if (!model) notFound()
  return (
    <>
      <Breadcrumbs
        items={[
          { label: messages.navigation.models, href: `/${locale}/modelle` },
          { label: model.name, href: `/${locale}/modelle/${slug}` },
          { label: messages.configurator.title },
        ]}
        locale={locale}
      />
      <header className="page-title page-container">
        <p className="eyebrow">{model.name}</p>
        <h1>{messages.configurator.title}</h1>
      </header>
      <ConfiguratorWizard
        basePriceCents={model.basePriceCents}
        locale={locale}
        modelSlug={model.slug}
      />
    </>
  )
}

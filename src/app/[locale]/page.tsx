import Image from 'next/image'
import Link from 'next/link'

import { ModelCarousel } from '@/components/model-carousel'
import { getMessages } from '@/lib/messages'
import { getModels } from '@/lib/models.queries'

import type { Metadata } from 'next'

export const revalidate = 60

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const messages = getMessages(locale)
  return { title: messages.home.title, description: messages.home.subtitle }
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const messages = getMessages(locale)
  const models = await getModels()
  return (
    <>
      <section className="hero">
        <div className="hero-art">
          <Image alt={messages.home.heroAlt} className="hero-image" fetchPriority="high" fill priority sizes="100vw" src="/media/showroom-hero.svg" />
        </div>
        <div className="hero-copy">
          <p className="eyebrow">{messages.home.eyebrow}</p>
          <h1>{messages.home.title}</h1>
          <p>{messages.home.subtitle}</p>
          <Link className="button button-primary" href={`/${locale}/modelle`}>{messages.home.cta}</Link>
        </div>
      </section>
      <section className="section page-container">
        <div className="section-heading"><p className="eyebrow">01 / BAVARIA</p><h2>{messages.home.models}</h2></div>
        <ModelCarousel models={models} locale={locale} />
      </section>
      <section className="feature-banner page-container">
        <div><p className="eyebrow">ELEKTRISCH. EINFACH. WEITER.</p><h2>{messages.home.electric}</h2><p>{messages.home.subtitle}</p></div>
        <Link className="button button-secondary" href={`/${locale}/elektro`}>{messages.navigation.electric}</Link>
      </section>
      <section className="section page-container teaser-grid">
        <article className="teaser"><p className="eyebrow">SERVICE</p><h2>{messages.home.service}</h2><Link href={`/${locale}/haendler`}>{messages.navigation.dealers} →</Link></article>
        <article className="teaser"><p className="eyebrow">ERLEBEN</p><h2>{messages.leads.testDriveTitle}</h2><Link href={`/${locale}/probefahrt`}>{messages.navigation.testDrive} →</Link></article>
      </section>
    </>
  )
}

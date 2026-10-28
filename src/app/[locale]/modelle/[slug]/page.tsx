import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Breadcrumbs } from '@/components/breadcrumbs'
import { MediaGallery } from '@/components/media-gallery'
import { StickySubnav } from '@/components/sticky-subnav'
import { formatPrice } from '@/lib/format-price'
import { getMessages } from '@/lib/messages'
import { getModelBySlug, getModels } from '@/lib/models.queries'

import type { Metadata } from 'next'

export const revalidate = 3600

export async function generateStaticParams() {
  const models = await getModels()
  return models.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const vehicle = await getModelBySlug(slug)
  if (!vehicle) return {}
  const baseUrl = process.env.APP_BASE_URL ?? 'https://example.invalid'
  return {
    title: vehicle.name,
    description: `${vehicle.name} – ${vehicle.powerKw} kW, ${vehicle.rangeKm} km Reichweite.`,
    alternates: {
      canonical: `${baseUrl}/${locale}/modelle/${slug}`,
      languages: {
        'de-DE': `${baseUrl}/de-de/modelle/${slug}`,
        'en-GB': `${baseUrl}/en-gb/modelle/${slug}`,
      },
    },
    openGraph: { title: vehicle.name, description: vehicle.highlights.join(' · ') },
  }
}

export default async function ModelDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const [vehicle, messages] = await Promise.all([
    getModelBySlug(slug),
    Promise.resolve(getMessages(locale)),
  ])
  if (!vehicle) notFound()
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': ['Vehicle', 'Product'],
    name: vehicle.name,
    description: vehicle.highlights.join('. '),
    vehicleModelDate: '2026',
    vehicleEngine: { '@type': 'EngineSpecification', enginePower: `${vehicle.powerKw} kW` },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'EUR',
      price: (vehicle.basePriceCents / 100).toFixed(0),
    },
  }
  return (
    <>
      <Breadcrumbs
        items={[
          { label: messages.navigation.models, href: `/${locale}/modelle` },
          { label: vehicle.name },
        ]}
        locale={locale}
      />
      <section className="detail-hero">
        <div className="page-container">
          <p className="eyebrow">
            {vehicle.bodyType} · {vehicle.fuelType}
          </p>
          <h1>{vehicle.name}</h1>
          <p>
            {messages.vehicle.from} {formatPrice(vehicle.basePriceCents, locale)}
          </p>
        </div>
      </section>
      <div className="page-container detail-content">
        <div>
          <StickySubnav
            items={[
              { id: 'detail-0', label: messages.vehicle.overview },
              { id: 'detail-1', label: messages.vehicle.design },
              { id: 'detail-2', label: messages.vehicle.specs },
              { id: 'detail-3', label: messages.vehicle.equipment },
              { id: 'detail-4', label: messages.vehicle.gallery },
            ]}
          />
          <section className="detail-section" id="detail-0">
            <h2>{messages.vehicle.overview}</h2>
            <ul>
              {vehicle.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          </section>
          <section className="detail-section" id="detail-1">
            <h2>{messages.vehicle.design}</h2>
            <div
              aria-label={vehicle.heroImage.alt}
              className="vehicle-art"
              role="img"
              style={{ background: vehicle.heroImage.url }}
            >
              <span>{vehicle.name}</span>
            </div>
          </section>
          <section className="detail-section" id="detail-2">
            <h2>{messages.vehicle.specs}</h2>
            <table className="spec-table">
              <tbody>
                <tr>
                  <th>{messages.vehicle.power}</th>
                  <td>{vehicle.powerKw} kW</td>
                </tr>
                <tr>
                  <th>{messages.vehicle.range}</th>
                  <td>{vehicle.rangeKm ? `${vehicle.rangeKm} km` : '–'}</td>
                </tr>
                <tr>
                  <th>{messages.vehicle.consumption}</th>
                  <td>{vehicle.consumption}</td>
                </tr>
                <tr>
                  <th>{messages.vehicle.dimensions}</th>
                  <td>4.620 × 1.840 × 1.460 mm</td>
                </tr>
                <tr>
                  <th>{messages.vehicle.fuelType}</th>
                  <td>{vehicle.fuelType}</td>
                </tr>
              </tbody>
            </table>
          </section>
          <section className="detail-section" id="detail-3">
            <h2>{messages.vehicle.equipment}</h2>
            <p>{vehicle.highlights.join(' · ')}</p>
          </section>
          <section className="detail-section" id="detail-4">
            <h2>{messages.vehicle.gallery}</h2>
            <MediaGallery locale={locale} modelName={vehicle.name} />
          </section>
        </div>
        <aside className="detail-cta">
          <p>{messages.vehicle.from}</p>
          <strong>{formatPrice(vehicle.basePriceCents, locale)}</strong>
          <p>
            <Link
              className="button button-primary"
              href={`/${locale}/konfigurator/${vehicle.slug}`}
            >
              {messages.vehicle.configure}
            </Link>
          </p>
          <Link href={`/${locale}/probefahrt?model=${vehicle.slug}`}>
            {messages.navigation.testDrive}
          </Link>
        </aside>
      </div>
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
        }}
        type="application/ld+json"
      />
    </>
  )
}

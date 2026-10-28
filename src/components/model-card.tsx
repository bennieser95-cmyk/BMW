import Image from 'next/image'
import Link from 'next/link'

import type { Vehicle } from '@/domain/vehicle/vehicle.types'
import { formatPrice } from '@/lib/format-price'
import { getMessages } from '@/lib/messages'

export function ModelCard({ vehicle, locale }: { vehicle: Vehicle; locale: string }) {
  const messages = getMessages(locale)
  return (
    <article className="model-card">
      <Link aria-label={`${vehicle.name} – ${messages.models.details}`} href={`/${locale}/modelle/${vehicle.slug}`}>
        <div className="vehicle-art" style={{ background: vehicle.heroImage.url }}>
          <Image alt={vehicle.heroImage.alt} fill sizes="(max-width: 767px) 90vw, (max-width: 1023px) 45vw, 25vw" src="/media/vehicle-illustration.svg" />
          <span>{vehicle.name}</span>
        </div>
        <div className="model-card-copy">
          <p className="eyebrow">{messages.vehicle.bodyTypes[vehicle.bodyType]} · {messages.vehicle.fuelType}: {messages.vehicle.fuelTypes[vehicle.fuelType]}</p>
          <h3>{vehicle.name}</h3>
          <p>{messages.vehicle.from} {formatPrice(vehicle.basePriceCents, locale)}</p>
        </div>
      </Link>
    </article>
  )
}

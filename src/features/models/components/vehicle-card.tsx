'use client'

import NextLink from 'next/link'

import { PriceDisplay } from '@/components/patterns/price-display'
import { Badge } from '@/components/ui/badge'
import { Icon } from '@/components/ui/icon'
import { Media } from '@/components/ui/media'
import type { StillMedia } from '@/components/ui/media.types'
import type { Vehicle } from '@/domain/vehicle/vehicle.types'

export interface VehicleCardLabels {
  /** Price prefix, e.g. "ab". */
  from: string
  /** Translated fuel type of this vehicle, e.g. "Elektro". */
  fuelType: string
  power: string
  range: string
  details: string
}

export interface VehicleCardProps {
  vehicle: Vehicle
  locale: string
  href: string
  labels: VehicleCardLabels
  /** Fired when the card link is activated (e.g. analytics, comparison). */
  onSelect?: (vehicle: Vehicle) => void
  /** Preload the image when the card is the LCP element (first row). */
  preload?: boolean
}

const PLACEHOLDERS = 4

/** Mock data stores CSS gradients instead of image paths; those map to placeholder SVGs. */
function toMedia(vehicle: Vehicle): StillMedia {
  const { url, alt, width, height } = vehicle.heroImage
  if (url.startsWith('/') || url.startsWith('https://')) return { type: 'image', src: url, alt, width, height }
  const index = (Array.from(vehicle.slug).reduce((sum, char) => sum + char.charCodeAt(0), 0) % PLACEHOLDERS) + 1
  return { type: 'image', src: `/media/placeholders/vehicle-${index}.svg`, alt, width: 1600, height: 900 }
}

/**
 * Model card: the whole card is clickable via a stretched link, but only the heading is the
 * link text, so screen readers announce a concise link name.
 */
export function VehicleCard({ vehicle, locale, href, labels, onSelect, preload = false }: VehicleCardProps) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-md bg-surface text-text">
      <div className="relative aspect-video overflow-hidden">
        <Media
          media={toMedia(vehicle)}
          sizes="(min-width: 90rem) 25vw, (min-width: 64rem) 33vw, (min-width: 48rem) 50vw, 100vw"
          preload={preload}
          className="transition-transform duration-(--motion-slow) ease-standard group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <Badge className="w-fit">{labels.fuelType}</Badge>
        <h3 className="text-xl">
          <NextLink
            href={href}
            onClick={() => onSelect?.(vehicle)}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:focus-ring"
          >
            {vehicle.name}
          </NextLink>
        </h3>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <dt className="text-text-muted">{labels.power}</dt>
            <dd className="font-medium tabular-nums">{vehicle.powerKw} kW</dd>
          </div>
          <div>
            <dt className="text-text-muted">{labels.range}</dt>
            <dd className="font-medium tabular-nums">{vehicle.rangeKm} km</dd>
          </div>
        </dl>
        <div className="mt-auto flex items-end justify-between gap-2">
          <PriceDisplay amountCents={vehicle.basePriceCents} locale={locale} prefix={labels.from} size="lg" />
          <span aria-hidden="true" className="inline-flex items-center gap-1 text-sm font-medium text-brand-primary">
            {labels.details}
            <Icon name="arrow-right" size="sm" className="transition-transform duration-(--motion-fast) ease-standard group-hover:translate-x-1 rtl:rotate-180" />
          </span>
        </div>
      </div>
    </article>
  )
}

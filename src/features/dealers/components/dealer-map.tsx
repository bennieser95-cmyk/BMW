'use client'

import type { Dealer } from '@/domain/dealer/dealer.types'
import { cn } from '@/lib/cn'

export interface GeoPoint {
  lat: number
  lon: number
}

export interface DealerMapProps {
  dealers: Dealer[]
  center: GeoPoint
  selectedId?: string | null
  onSelect: (dealer: Dealer) => void
  labels: { map: string }
  className?: string
}

const PADDING = 0.1

/**
 * Provider-free map mock (no map vendor is decided yet, ADR-0007): dealers are projected
 * equirectangularly around `center` onto a gradient surface. Markers are real buttons, so the
 * map is fully keyboard operable; the DealerList remains the primary accessible view.
 */
export function DealerMap({
  dealers,
  center,
  selectedId = null,
  onSelect,
  labels,
  className,
}: DealerMapProps) {
  const span = dealers.reduce(
    (max, dealer) =>
      Math.max(max, Math.abs(dealer.geo.lat - center.lat), Math.abs(dealer.geo.lon - center.lon)),
    0.05,
  )
  const project = ({ lat, lon }: GeoPoint) => ({
    left: `${50 + ((lon - center.lon) / span) * (50 - PADDING * 100)}%`,
    top: `${50 - ((lat - center.lat) / span) * (50 - PADDING * 100)}%`,
  })

  return (
    <div
      role="group"
      aria-label={labels.map}
      className={cn(
        'border-border bg-surface relative aspect-square overflow-hidden rounded-md border md:aspect-video',
        className,
      )}
    >
      <div aria-hidden="true" className="map-placeholder absolute inset-0" />
      {dealers.map((dealer) => {
        const isSelected = dealer.id === selectedId
        return (
          <button
            key={dealer.id}
            type="button"
            aria-pressed={isSelected}
            aria-label={dealer.name}
            onClick={() => onSelect(dealer)}
            style={project(dealer.geo)}
            className={cn(
              'size-touch absolute flex -translate-x-1/2 -translate-y-full items-end justify-center',
              isSelected ? 'text-brand-accent z-1' : 'text-brand-primary',
            )}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 32"
              className={cn(
                'ease-standard size-8 fill-current transition-transform duration-(--motion-fast)',
                isSelected && 'scale-125',
              )}
            >
              <path d="M12 0C5.4 0 0 5.2 0 11.7 0 20.5 12 32 12 32s12-11.5 12-20.3C24 5.2 18.6 0 12 0z" />
              <circle cx="12" cy="11.5" r="4.5" className="fill-bg" />
            </svg>
          </button>
        )
      })}
    </div>
  )
}

'use client'

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import type { Dealer } from '@/domain/dealer/dealer.types'
import { cn } from '@/lib/cn'

export interface DealerListProps {
  dealers: Dealer[]
  selectedId?: string | null
  onSelect: (dealer: Dealer) => void
  labels: {
    list: string
    select: string
    /** Service code → translated label, e.g. { sales: "Verkauf" }. */
    services: Record<string, string>
  }
  className?: string
}

/** Result list for the dealer search; selection is mirrored on the DealerMap by the parent. */
export function DealerList({
  dealers,
  selectedId = null,
  onSelect,
  labels,
  className,
}: DealerListProps) {
  return (
    <ul aria-label={labels.list} className={cn('divide-border flex flex-col divide-y', className)}>
      {dealers.map((dealer) => {
        const isSelected = dealer.id === selectedId
        return (
          <li
            key={dealer.id}
            id={`dealer-${dealer.id}`}
            className={cn(
              'flex flex-col gap-2 border-s-4 py-4 ps-4',
              isSelected ? 'border-brand-primary bg-surface' : 'border-transparent',
            )}
          >
            <h3 className="text-lg font-medium">{dealer.name}</h3>
            <address className="text-text-muted flex items-start gap-1 text-sm not-italic">
              <Icon name="map-pin" size="sm" className="mt-px" />
              <span>
                {dealer.address}, {dealer.postalCode} {dealer.city}
              </span>
            </address>
            <ul className="flex flex-wrap gap-2 text-xs">
              {dealer.services.map((service) => (
                <li
                  key={service}
                  className="border-border-strong text-text rounded-sm border px-2 py-1"
                >
                  {labels.services[service] ?? service}
                </li>
              ))}
            </ul>
            <Button
              variant="secondary"
              size="sm"
              aria-pressed={isSelected}
              onClick={() => onSelect(dealer)}
              className="w-fit"
            >
              {labels.select}
              <span className="sr-only">: {dealer.name}</span>
            </Button>
          </li>
        )
      })}
    </ul>
  )
}

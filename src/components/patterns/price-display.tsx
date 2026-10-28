import { cn } from '@/lib/cn'
import { formatPrice } from '@/lib/format-price'

export interface PriceDisplayProps {
  amountCents: number
  locale: string
  /** ISO 4217 code; defaults to EUR. */
  currency?: string
  /** Text before the amount, e.g. "ab" or "Gesamtpreis". */
  prefix?: string
  /** Announce changes politely (configurator total price, BAV-UX-007 6). */
  live?: boolean
  size?: 'md' | 'lg' | 'xl'
  className?: string
}

const SIZE_CLASSES = { md: 'text-base', lg: 'text-xl', xl: 'text-3xl' } as const

/** Locale-aware price; amounts are integer cents to avoid floating-point rounding. */
export function PriceDisplay({
  amountCents,
  locale,
  currency = 'EUR',
  prefix,
  live = false,
  size = 'md',
  className,
}: PriceDisplayProps) {
  return (
    <p
      className={cn('text-text flex items-baseline gap-2', className)}
      {...(live ? { 'aria-live': 'polite' as const, 'aria-atomic': true } : {})}
    >
      {prefix ? <span className="text-text-muted text-sm">{prefix}</span> : null}
      <strong className={cn('font-semibold tabular-nums', SIZE_CLASSES[size])}>
        {formatPrice(amountCents, locale, currency)}
      </strong>
    </p>
  )
}

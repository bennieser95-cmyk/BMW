'use client'

import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/cn'

import type { ComponentPropsWithRef } from 'react'

export interface FilterChipProps
  extends Omit<ComponentPropsWithRef<'button'>, 'onToggle' | 'aria-pressed'> {
  selected: boolean
  onToggle: (selected: boolean) => void
  /** Optional result count shown after the label, e.g. "(4)". */
  count?: number
}

/** Toggle button for filter values; state is exposed via aria-pressed. */
export function FilterChip({ selected, onToggle, count, className, children, ...props }: FilterChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onToggle(!selected)}
      className={cn(
        'inline-flex min-h-touch items-center gap-2 rounded-pill border px-4 text-sm font-medium',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'transition-transform duration-(--motion-fast) ease-standard active:scale-[0.98]',
        selected
          ? 'border-text bg-text text-bg'
          : 'border-border-strong bg-bg text-text hover:border-text',
        className,
      )}
      {...props}
    >
      {selected ? <Icon name="check" size="sm" /> : null}
      <span>{children}</span>
      {count === undefined ? null : <span className="tabular-nums opacity-80">({count})</span>}
    </button>
  )
}

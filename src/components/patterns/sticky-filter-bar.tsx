import { cn } from '@/lib/cn'

import type { ReactNode } from 'react'

export interface StickyFilterBarProps {
  /** Accessible name of the filter region, e.g. "Filter". */
  label: string
  /** Filter controls (chips, selects). */
  children: ReactNode
  /** Result count / sort, aligned to the end. */
  endSlot?: ReactNode
  className?: string
}

/**
 * Filter bar that sticks below the header. It only sticks below the header's height because
 * the header slides out on scroll-down and the bar then becomes the topmost element.
 */
export function StickyFilterBar({ label, children, endSlot, className }: StickyFilterBarProps) {
  return (
    <section
      aria-label={label}
      className={cn('sticky top-0 z-(--z-header) border-b border-border bg-bg/95 backdrop-blur', className)}
    >
      <div className="layout-container flex flex-wrap items-center gap-2 py-2">
        <div className="flex flex-1 flex-wrap items-center gap-2">{children}</div>
        {endSlot ? <div className="flex items-center gap-4">{endSlot}</div> : null}
      </div>
    </section>
  )
}

import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/cn'

import type { ReactNode } from 'react'

export interface EmptyStateProps {
  title: string
  description?: string
  /** Recovery action, e.g. a "Filter zurücksetzen" button (BAV-UX-007 5.3). */
  action?: ReactNode
  className?: string
}

/** Shown when a list has no results; announced politely because it replaces the results. */
export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div
      role="status"
      className={cn(
        'bg-surface flex flex-col items-center gap-4 rounded-md px-6 py-16 text-center',
        className,
      )}
    >
      <Icon name="search" size="lg" className="text-text-muted" />
      <p className="text-text text-xl font-medium">{title}</p>
      {description ? <p className="text-text-muted max-w-prose">{description}</p> : null}
      {action}
    </div>
  )
}

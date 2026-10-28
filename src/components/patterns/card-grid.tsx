import { cn } from '@/lib/cn'

import type { ComponentPropsWithRef } from 'react'

export type CardGridProps = ComponentPropsWithRef<'ul'>

/** Card list with 1 / 2 / 3 / 4 columns on xs / md / lg / xl (BAV-UX-007 5.3). */
export function CardGrid({ className, ...props }: CardGridProps) {
  return <ul className={cn('card-grid', className)} {...props} />
}

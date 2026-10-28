import { cn } from '@/lib/cn'

import type { ReactNode } from 'react'

export interface BottomBarCtaProps {
  /** Primary action, e.g. <Button asChild><Link>Konfigurieren</Link></Button>. */
  action: ReactNode
  /** Supporting info such as <PriceDisplay prefix="ab" />. */
  info?: ReactNode
  className?: string
}

/**
 * Permanently visible CTA on mobile (BAV-UX-007 5.3). Hidden from lg upwards where the CTA
 * lives in the sticky subnavigation. Pages must add bottom padding (pb-24) so it covers nothing.
 */
export function BottomBarCta({ action, info, className }: BottomBarCtaProps) {
  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-(--z-header) border-t border-border bg-bg pb-[env(safe-area-inset-bottom)] lg:hidden',
        className,
      )}
    >
      <div className="layout-container flex items-center justify-between gap-4 py-3">
        {info ? <div className="min-w-0">{info}</div> : null}
        <div className="ms-auto">{action}</div>
      </div>
    </div>
  )
}

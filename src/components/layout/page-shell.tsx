import { SkipLink } from './skip-link'

import type { ReactNode } from 'react'

export interface PageShellProps {
  header: ReactNode
  footer: ReactNode
  children: ReactNode
  /** Rendered above the page content inside <main>, e.g. <Breadcrumb />. */
  breadcrumb?: ReactNode
  /** Text of the skip link, e.g. "Zum Inhalt springen". */
  skipLinkLabel: string
  /** Consent banner, toasts or other fixed overlays rendered after the footer. */
  overlaySlot?: ReactNode
}

/**
 * Page template: skip link first in tab order, then header, main landmark and footer.
 * main is programmatically focusable so the skip link moves focus, not just the scroll position.
 */
export function PageShell({
  header,
  footer,
  children,
  breadcrumb,
  skipLinkLabel,
  overlaySlot,
}: PageShellProps) {
  return (
    <>
      <SkipLink label={skipLinkLabel} />
      {header}
      <main id="main-content" tabIndex={-1} className="outline-none">
        {breadcrumb ? <div className="layout-container py-4">{breadcrumb}</div> : null}
        {children}
      </main>
      {footer}
      {overlaySlot}
    </>
  )
}

'use client'

import Link from 'next/link'

import { getMessages } from '@/lib/messages'

export function SiteFooter({ locale }: { locale: string }) {
  const messages = getMessages(locale)
  return (
    <footer className="site-footer">
      <div className="page-container footer-inner">
        <Link className="wordmark" href={`/${locale}`}>BAVARIA</Link>
        <nav aria-label="Rechtliches" className="footer-links">
          <Link href={`/${locale}/impressum`}>{messages.legal.imprint}</Link>
          <Link href={`/${locale}/datenschutz`}>{messages.legal.privacy}</Link>
          <Link href={`/${locale}/kontakt`}>{messages.navigation.contact}</Link>
          <button onClick={() => window.dispatchEvent(new Event('bavaria:open-consent'))} type="button">{messages.consent.settings}</button>
        </nav>
        <p>© 2026 BAVARIA Digital Showroom · Synthetische Inhalte</p>
      </div>
    </footer>
  )
}

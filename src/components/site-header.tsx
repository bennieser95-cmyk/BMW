'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

import { getMessages } from '@/lib/messages'

export function SiteHeader({ locale }: { locale: string }) {
  const messages = getMessages(locale)
  const [menuOpen, setMenuOpen] = useState(false)
  const otherLocale = locale === 'de-de' ? 'en-gb' : 'de-de'
  const pathname = usePathname()
  const localizedPath = pathname.replace(/^\/(de-de|en-gb)(?=\/|$)/, `/${otherLocale}`)
  return (
    <header className="site-header">
      <Link aria-label="BAVARIA Startseite" className="wordmark" href={`/${locale}`}>BAVARIA<span> / DIGITAL SHOWROOM</span></Link>
      <nav aria-label="Hauptnavigation" className="desktop-nav">
        <details className="menu-disclosure">
          <summary>{messages.navigation.models}</summary>
          <div className="menu-panel">
            <Link href={`/${locale}/modelle`}>{messages.models.title}</Link>
            <Link href={`/${locale}/modelle?antrieb=elektro`}>{messages.navigation.electric}</Link>
            <Link href={`/${locale}/elektro`}>{messages.home.electric}</Link>
          </div>
        </details>
        <Link href={`/${locale}/haendler`}>{messages.navigation.dealers}</Link>
        <Link href={`/${locale}/probefahrt`}>{messages.navigation.testDrive}</Link>
      </nav>
      <div className="header-actions">
        <Link className="header-search" href={`/${locale}/suche`}>{messages.navigation.search}</Link>
        <Link aria-label={messages.navigation.language} className="locale-switch" href={localizedPath}>{otherLocale.toUpperCase()}</Link>
        <Link className="account-link" href={`/${locale}/konto`}>{messages.navigation.account}</Link>
        <button aria-expanded={menuOpen} aria-label={messages.common.menu} className="mobile-menu-button" onClick={() => setMenuOpen(!menuOpen)} type="button">☰</button>
      </div>
      {menuOpen && <nav aria-label="Mobilnavigation" className="mobile-nav">
        <Link href={`/${locale}/modelle`} onClick={() => setMenuOpen(false)}>{messages.navigation.models}</Link>
        <Link href={`/${locale}/elektro`} onClick={() => setMenuOpen(false)}>{messages.navigation.electric}</Link>
        <Link href={`/${locale}/haendler`} onClick={() => setMenuOpen(false)}>{messages.navigation.dealers}</Link>
        <Link href={`/${locale}/kontakt`} onClick={() => setMenuOpen(false)}>{messages.navigation.contact}</Link>
      </nav>}
    </header>
  )
}

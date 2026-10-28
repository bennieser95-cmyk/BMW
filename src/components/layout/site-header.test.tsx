import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { describe, expect, it, vi } from 'vitest'

import { PageShell } from './page-shell'
import { SiteHeader } from './site-header'

import type { NavItem, SiteHeaderLabels } from './navigation.types'

vi.mock('next/navigation', () => ({ usePathname: () => '/de-de/modelle' }))

const items: NavItem[] = [
  { id: 'models', label: 'Modelle', groups: [{ links: [{ label: 'Fahrzeuge entdecken', href: '/de-de/modelle' }] }] },
]
const labels: SiteHeaderLabels = {
  mainNav: 'Hauptnavigation',
  mobileNav: 'Mobilnavigation',
  openMenu: 'Menü öffnen',
  closeMenu: 'Menü schließen',
  homeLink: 'Bavaria Motors – Startseite',
  search: 'Suche',
  language: 'Sprache',
}

function renderShell(overlay = false) {
  return render(
    <PageShell
      skipLinkLabel="Zum Inhalt springen"
      header={<SiteHeader navItems={items} locale="de-de" labels={labels} overlay={overlay} accountSlot={<span>Konto</span>} />}
      footer={<footer>Fußzeile</footer>}
    >
      <h1>Inhalt</h1>
    </PageShell>,
  )
}

async function scrollTo(y: number) {
  Object.defineProperty(window, 'scrollY', { configurable: true, value: y })
  await act(async () => {
    window.dispatchEvent(new Event('scroll'))
    await new Promise((resolve) => requestAnimationFrame(resolve))
  })
}

describe('SiteHeader in PageShell', () => {
  it('should focus the skip link first and target the focusable main when tabbing', async () => {
    renderShell()
    await userEvent.tab()
    const skip = screen.getByRole('link', { name: 'Zum Inhalt springen' })
    expect(skip).toHaveFocus()
    // jsdom does not move focus on fragment navigation; browsers focus the tabindex=-1 target.
    expect(skip).toHaveAttribute('href', '#main-content')
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content')
    expect(screen.getByRole('main')).toHaveAttribute('tabindex', '-1')
  })

  it('should link the locale switch to the same page in the other locale', () => {
    renderShell()
    expect(screen.getAllByRole('link', { name: 'Sprache' })[0]).toHaveAttribute('href', '/en-gb/modelle')
  })

  it('should be transparent over a hero and solid after scrolling 80 px when overlay is set', async () => {
    renderShell(true)
    const header = screen.getByRole('banner')
    expect(header).toHaveClass('text-on-media')
    await scrollTo(120)
    expect(header).toHaveClass('bg-bg')
  })

  it('should hide when scrolling down and reappear when scrolling up', async () => {
    renderShell()
    const header = screen.getByRole('banner')
    await scrollTo(200)
    await scrollTo(600)
    expect(header).toHaveClass('-translate-y-full')
    await scrollTo(400)
    expect(header).toHaveClass('translate-y-0')
  })

  it('should have no axe violations when rendered', async () => {
    const { container } = renderShell()
    expect(await axe(container)).toHaveNoViolations()
  })
})

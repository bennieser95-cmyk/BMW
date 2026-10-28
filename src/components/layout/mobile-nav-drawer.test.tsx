import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { describe, expect, it } from 'vitest'

import { MobileNavDrawer } from './mobile-nav-drawer'

import type { NavItem } from './navigation.types'

const items: NavItem[] = [
  { id: 'models', label: 'Modelle', groups: [{ links: [{ label: 'Fahrzeuge entdecken', href: '/de/modelle' }] }] },
  { id: 'dealers', label: 'Händler', href: '/de/haendler' },
]
const labels = { mobileNav: 'Mobilnavigation', openMenu: 'Menü öffnen', closeMenu: 'Menü schließen' }

describe('MobileNavDrawer', () => {
  it('should open a modal dialog with accordions when the menu button is pressed', async () => {
    render(<MobileNavDrawer items={items} labels={labels} />)
    await userEvent.click(screen.getByRole('button', { name: 'Menü öffnen' }))
    const dialog = screen.getByRole('dialog', { name: 'Mobilnavigation' })
    await userEvent.click(within(dialog).getByRole('button', { name: 'Modelle' }))
    expect(within(dialog).getByRole('link', { name: 'Fahrzeuge entdecken' })).toBeVisible()
  })

  it('should keep focus inside the drawer when tabbing past the last element', async () => {
    render(<MobileNavDrawer items={items} labels={labels} />)
    await userEvent.click(screen.getByRole('button', { name: 'Menü öffnen' }))
    const dialog = screen.getByRole('dialog')
    for (let i = 0; i < 6; i += 1) {
      await userEvent.tab()
      expect(dialog).toContainElement(document.activeElement as HTMLElement)
    }
  })

  it('should return focus to the trigger when closed with Escape', async () => {
    render(<MobileNavDrawer items={items} labels={labels} />)
    const trigger = screen.getByRole('button', { name: 'Menü öffnen' })
    await userEvent.click(trigger)
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('should have no axe violations when open', async () => {
    render(<MobileNavDrawer items={items} labels={labels} />)
    await userEvent.click(screen.getByRole('button', { name: 'Menü öffnen' }))
    expect(await axe(document.body)).toHaveNoViolations()
  })
})

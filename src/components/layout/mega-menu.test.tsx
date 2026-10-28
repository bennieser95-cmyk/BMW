import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { describe, expect, it, vi } from 'vitest'

import { MegaMenu } from './mega-menu'

import type { NavItem } from './navigation.types'

const items: NavItem[] = [
  {
    id: 'models',
    label: 'Modelle',
    groups: [{ title: 'Alle', links: [{ label: 'Fahrzeuge entdecken', href: '/de/modelle' }] }],
  },
  { id: 'dealers', label: 'Händler', href: '/de/haendler' },
]

function renderMenu(onOpenChange = vi.fn()) {
  render(<MegaMenu items={items} label="Hauptnavigation" onOpenChange={onOpenChange} />)
  return { trigger: screen.getByRole('button', { name: 'Modelle' }), onOpenChange }
}

describe('MegaMenu', () => {
  it('should open the panel and focus its first link when the trigger is clicked', async () => {
    const { trigger, onOpenChange } = renderMenu()
    await userEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('link', { name: 'Fahrzeuge entdecken' })).toHaveFocus()
    expect(onOpenChange).toHaveBeenLastCalledWith(true)
  })

  it('should close and return focus to the trigger when Escape is pressed', async () => {
    const { trigger } = renderMenu()
    await userEvent.click(trigger)
    await userEvent.keyboard('{Escape}')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveFocus()
  })

  it('should open only after the hover intent delay when a mouse enters the trigger', () => {
    vi.useFakeTimers()
    try {
      const { trigger } = renderMenu()
      fireEvent.pointerEnter(trigger, { pointerType: 'mouse' })
      act(() => vi.advanceTimersByTime(100))
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
      act(() => vi.advanceTimersByTime(60))
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
    } finally {
      vi.useRealTimers()
    }
  })

  it('should not open when the mouse leaves before the hover intent delay', () => {
    vi.useFakeTimers()
    try {
      const { trigger } = renderMenu()
      fireEvent.pointerEnter(trigger, { pointerType: 'mouse' })
      act(() => vi.advanceTimersByTime(80))
      fireEvent.pointerLeave(trigger)
      act(() => vi.advanceTimersByTime(200))
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    } finally {
      vi.useRealTimers()
    }
  })

  it('should close when a pointer is pressed outside the navigation', async () => {
    const { trigger } = renderMenu()
    await userEvent.click(trigger)
    fireEvent.pointerDown(document.body)
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'))
  })

  it('should have no axe violations when a panel is open', async () => {
    const { trigger } = renderMenu()
    await userEvent.click(trigger)
    expect(await axe(document.body)).toHaveNoViolations()
  })
})

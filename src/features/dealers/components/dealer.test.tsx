import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { describe, expect, it, vi } from 'vitest'

import type { Dealer } from '@/domain/dealer/dealer.types'

import { DealerList } from './dealer-list'
import { DealerMap } from './dealer-map'


const dealers: Dealer[] = [
  { id: 'm1', name: 'Autohaus München', city: 'München', postalCode: '80331', address: 'Marienplatz 1', geo: { lat: 48.137, lon: 11.575 }, services: ['sales'] },
  { id: 'a1', name: 'Autohaus Augsburg', city: 'Augsburg', postalCode: '86150', address: 'Rathausplatz 2', geo: { lat: 48.369, lon: 10.898 }, services: ['service'] },
]
const listLabels = { list: 'Händlerliste', select: 'Händler auswählen', services: { sales: 'Verkauf', service: 'Werkstatt' } }

describe('DealerList', () => {
  it('should report the dealer and translate services when a dealer is selected', async () => {
    const onSelect = vi.fn()
    render(<DealerList dealers={dealers} selectedId="a1" onSelect={onSelect} labels={listLabels} />)
    expect(screen.getByText('Verkauf')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Autohaus Augsburg/ })).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(screen.getByRole('button', { name: /Autohaus München/ }))
    expect(onSelect).toHaveBeenCalledWith(dealers[0])
  })

  it('should have no axe violations when rendered', async () => {
    const { container } = render(<DealerList dealers={dealers} onSelect={vi.fn()} labels={listLabels} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('DealerMap', () => {
  it('should render keyboard operable markers when dealers are given', async () => {
    const onSelect = vi.fn()
    const { container } = render(
      <DealerMap dealers={dealers} center={{ lat: 48.2, lon: 11.2 }} selectedId="m1" onSelect={onSelect} labels={{ map: 'Händlerkarte' }} />,
    )
    expect(screen.getByRole('group', { name: 'Händlerkarte' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Autohaus München' })).toHaveAttribute('aria-pressed', 'true')
    screen.getByRole('button', { name: 'Autohaus Augsburg' }).focus()
    await userEvent.keyboard('{Enter}')
    expect(onSelect).toHaveBeenCalledWith(dealers[1])
    expect(await axe(container)).toHaveNoViolations()
  })
})

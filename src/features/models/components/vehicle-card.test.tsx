import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { describe, expect, it, vi } from 'vitest'

import type { Vehicle } from '@/domain/vehicle/vehicle.types'

import { SpecTable } from './spec-table'
import { VehicleCard } from './vehicle-card'


const vehicle: Vehicle = {
  id: 'v1',
  slug: 'i7-limousine',
  name: 'Bavaria i7 Limousine',
  bodyType: 'sedan',
  fuelType: 'electric',
  basePriceCents: 10990000,
  powerKw: 400,
  rangeKm: 610,
  consumption: '18,4 kWh/100 km',
  heroImage: { url: 'linear-gradient(red, blue)', alt: 'Bavaria i7 von vorne', width: 1600, height: 900 },
  highlights: [],
}
const labels = { from: 'ab', fuelType: 'Elektro', power: 'Leistung', range: 'Reichweite', details: 'Details' }

describe('VehicleCard', () => {
  it('should expose the vehicle name as the card link when rendered', async () => {
    const onSelect = vi.fn()
    const { container } = render(
      <VehicleCard vehicle={vehicle} locale="de-de" href="/de-de/modelle/i7-limousine" labels={labels} onSelect={onSelect} />,
    )
    const link = screen.getByRole('link', { name: 'Bavaria i7 Limousine' })
    expect(link).toHaveAttribute('href', '/de-de/modelle/i7-limousine')
    expect(screen.getByRole('img', { name: 'Bavaria i7 von vorne' })).toHaveAttribute('src', expect.stringContaining('/media/placeholders/vehicle-'))
    expect(screen.getByText(/109\.900/)).toBeInTheDocument()
    link.addEventListener('click', (event) => event.preventDefault())
    await userEvent.click(link)
    expect(onSelect).toHaveBeenCalledWith(vehicle)
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('SpecTable', () => {
  it('should render row headers per group when groups are given', async () => {
    const { container } = render(
      <SpecTable
        caption="Technische Daten"
        groups={[{ id: 'drive', title: 'Antrieb', rows: [{ label: 'Leistung', value: '400 kW' }] }]}
      />,
    )
    expect(screen.getByRole('table', { name: 'Technische Daten' })).toBeInTheDocument()
    expect(screen.getByRole('rowheader', { name: 'Leistung' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: '400 kW' })).toBeInTheDocument()
    expect(await axe(container)).toHaveNoViolations()
  })
})

import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { describe, expect, it } from 'vitest'

import { PriceDisplay } from './price-display'

describe('PriceDisplay', () => {
  it('should format cents in the given locale when rendered', () => {
    render(<PriceDisplay amountCents={5_490_000} locale="de-de" prefix="ab" />)
    expect(screen.getByText(/54\.900\s€/)).toBeInTheDocument()
    expect(screen.getByText('ab')).toBeInTheDocument()
  })

  it('should use the given currency when currency is set', () => {
    render(<PriceDisplay amountCents={100_000} locale="en-gb" currency="GBP" />)
    expect(screen.getByText('£1,000')).toBeInTheDocument()
  })

  it('should announce updates politely when live is set', () => {
    const { container, rerender } = render(<PriceDisplay amountCents={100} locale="de-de" live />)
    const region = container.querySelector('[aria-live="polite"]')
    expect(region).not.toBeNull()
    rerender(<PriceDisplay amountCents={200_000} locale="de-de" live />)
    expect(region).toHaveTextContent(/2\.000\s€/)
  })

  it('should have no axe violations when rendered', async () => {
    const { container } = render(<PriceDisplay amountCents={100} locale="de-de" live />)
    expect(await axe(container)).toHaveNoViolations()
  })
})

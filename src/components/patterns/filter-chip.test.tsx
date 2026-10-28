import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { describe, expect, it, vi } from 'vitest'

import { FilterChip } from './filter-chip'

describe('FilterChip', () => {
  it('should call onToggle with the inverted state when clicked', async () => {
    const onToggle = vi.fn()
    render(
      <FilterChip selected={false} onToggle={onToggle}>
        Elektro
      </FilterChip>,
    )
    const chip = screen.getByRole('button', { name: 'Elektro' })
    expect(chip).toHaveAttribute('aria-pressed', 'false')
    await userEvent.click(chip)
    expect(onToggle).toHaveBeenCalledWith(true)
  })

  it('should be operable with the keyboard when focused', async () => {
    const onToggle = vi.fn()
    render(
      <FilterChip selected onToggle={onToggle} count={3}>
        SUV
      </FilterChip>,
    )
    await userEvent.tab()
    await userEvent.keyboard('{Enter}')
    expect(onToggle).toHaveBeenCalledWith(false)
  })

  it('should have no axe violations when rendered', async () => {
    const { container } = render(
      <FilterChip selected onToggle={() => undefined}>
        Coupé
      </FilterChip>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { describe, expect, it } from 'vitest'

import { Checkbox } from './checkbox'

describe('Checkbox', () => {
  it('should toggle when its label is clicked', async () => {
    render(<Checkbox label="Ich stimme zu" />)
    await userEvent.click(screen.getByText('Ich stimme zu'))
    expect(screen.getByRole('checkbox', { name: 'Ich stimme zu' })).toBeChecked()
  })

  it('should have no axe violations when rendered with error', async () => {
    const { container } = render(<Checkbox label="Zustimmung" error="Pflichtfeld" required />)
    expect(await axe(container)).toHaveNoViolations()
  })
})

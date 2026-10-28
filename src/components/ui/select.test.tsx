import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { describe, expect, it } from 'vitest'

import { Select } from './select'

describe('Select', () => {
  it('should change the value when an option is chosen', async () => {
    render(
      <Select
        label="Sortieren nach"
        options={[
          { value: 'price-asc', label: 'Preis aufsteigend' },
          { value: 'name', label: 'Name' },
        ]}
      />,
    )
    const select = screen.getByRole('combobox', { name: 'Sortieren nach' })
    await userEvent.selectOptions(select, 'name')
    expect(select).toHaveValue('name')
  })

  it('should have no axe violations when rendered with placeholder and error', async () => {
    const { container } = render(
      <Select
        label="Modell"
        placeholder="Bitte wählen"
        error="Pflichtfeld"
        options={[{ value: 'a', label: 'A' }]}
      />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

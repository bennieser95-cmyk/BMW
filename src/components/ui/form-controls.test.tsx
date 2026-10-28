import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { describe, expect, it } from 'vitest'

import { Checkbox } from './checkbox'
import { Input } from './input'
import { Select } from './select'

describe('Input', () => {
  it('should link label, hint and error when an error is given', () => {
    render(
      <Input label="E-Mail-Adresse" hint="Wir antworten per E-Mail." error="Ungültig" required />,
    )
    const input = screen.getByRole('textbox', { name: /E-Mail-Adresse/ })
    expect(input).toBeRequired()
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAccessibleDescription('Wir antworten per E-Mail. Ungültig')
  })

  it('should accept typed text when focused', async () => {
    render(<Input label="Vorname" />)
    const input = screen.getByRole('textbox', { name: 'Vorname' })
    await userEvent.type(input, 'Anna')
    expect(input).toHaveValue('Anna')
  })

  it('should have no axe violations when rendered with error', async () => {
    const { container } = render(<Input label="Nachname" error="Pflichtfeld" required />)
    expect(await axe(container)).toHaveNoViolations()
  })
})

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

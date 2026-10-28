import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { describe, expect, it } from 'vitest'

import { Input } from './input'

describe('Input', () => {
  it('should link label, hint and error when an error is given', () => {
    render(<Input label="E-Mail-Adresse" hint="Wir antworten per E-Mail." error="Ungültig" required />)
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

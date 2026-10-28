import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { describe, expect, it } from 'vitest'

import { FormField } from './form-field'

describe('FormField', () => {
  it('should wire label, description and error to the control when an error is given', () => {
    render(
      <FormField
        label="Wunschtermin"
        description="Format TT.MM.JJJJ"
        error="Bitte Datum wählen"
        required
        control={<input type="text" />}
      />,
    )
    const control = screen.getByRole('textbox', { name: /Wunschtermin/ })
    expect(control).toHaveAttribute('aria-invalid', 'true')
    expect(control).toHaveAttribute('aria-required', 'true')
    expect(control).toHaveAccessibleDescription('Format TT.MM.JJJJ Bitte Datum wählen')
  })

  it('should have no axe violations when rendered', async () => {
    const { container } = render(
      <FormField
        label="Händler"
        error="Pflichtfeld"
        control={
          <select>
            <option>A</option>
          </select>
        }
      />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

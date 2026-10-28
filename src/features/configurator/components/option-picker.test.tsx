import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { OptionPicker } from './option-picker'

const options = [
  { id: 'grey', label: 'Brooklyn Grey', priceDeltaCents: 0, swatch: 'rgb(110 112 114)' },
  { id: 'blue', label: 'Portimao Blau', priceDeltaCents: 120000, description: 'Metallic' },
  { id: 'red', label: 'Toronto Rot', priceDeltaCents: 95000 },
]
const labels = { legend: 'Lackierung', included: 'Inklusive' }

function SingleHarness({ onChange }: { onChange: (id: string) => void }) {
  const [value, setValue] = useState<string | null>('grey')
  return (
    <OptionPicker
      mode="single"
      value={value}
      onChange={(id) => {
        setValue(id)
        onChange(id)
      }}
      options={options}
      disabledReasons={{ red: 'Nicht mit M Sportpaket kombinierbar' }}
      locale="de-de"
      labels={labels}
    />
  )
}

describe('OptionPicker', () => {
  it('should select an option and show its price delta when chosen', async () => {
    const onChange = vi.fn()
    render(<SingleHarness onChange={onChange} />)
    expect(screen.getByText('Inklusive')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('radio', { name: 'Portimao Blau' }))
    expect(onChange).toHaveBeenCalledWith('blue')
    expect(screen.getByRole('radio', { name: 'Portimao Blau' })).toBeChecked()
    expect(screen.getByText(/1\.200\s€/)).toBeInTheDocument()
  })

  it('should disable an option and expose the reason when disabledReasons contains it', () => {
    render(<SingleHarness onChange={vi.fn()} />)
    const red = screen.getByRole('radio', { name: 'Toronto Rot' })
    expect(red).toBeDisabled()
    expect(red).toHaveAccessibleDescription('Nicht mit M Sportpaket kombinierbar')
  })

  it('should toggle several options when mode is multiple', async () => {
    const onChange = vi.fn()
    render(
      <OptionPicker mode="multiple" value={['grey']} onChange={onChange} options={options} locale="de-de" labels={labels} />,
    )
    await userEvent.click(screen.getByRole('checkbox', { name: 'Portimao Blau' }))
    expect(onChange).toHaveBeenCalledWith(['grey', 'blue'])
    await userEvent.click(screen.getByRole('checkbox', { name: 'Brooklyn Grey' }))
    expect(onChange).toHaveBeenLastCalledWith([])
  })

  it('should have no axe violations when an option is disabled', async () => {
    const { container } = render(<SingleHarness onChange={vi.fn()} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})

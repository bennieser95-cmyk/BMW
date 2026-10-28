import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { describe, expect, it, vi } from 'vitest'

import { ConfiguratorStepper } from './stepper'

const steps = [
  { id: 'model', label: 'Modell', complete: true },
  { id: 'engine', label: 'Antrieb', complete: true },
  { id: 'paint', label: 'Lack' },
  { id: 'wheels', label: 'Felgen' },
]
const labels = { nav: 'Konfigurationsschritte', stepOf: 'Schritt {current} von {total}', completed: 'abgeschlossen' }

describe('ConfiguratorStepper', () => {
  it('should mark the current step and announce progress when rendered', async () => {
    const { container } = render(<ConfiguratorStepper steps={steps} currentStep={2} onStepSelect={vi.fn()} labels={labels} />)
    expect(screen.getByRole('button', { name: /Lack/ })).toHaveAttribute('aria-current', 'step')
    expect(screen.getByText('Schritt 3 von 4')).toBeInTheDocument()
    expect(await axe(container)).toHaveNoViolations()
  })

  it('should allow going back to a completed step when it is clicked', async () => {
    const onStepSelect = vi.fn()
    render(<ConfiguratorStepper steps={steps} currentStep={2} onStepSelect={onStepSelect} labels={labels} />)
    await userEvent.click(screen.getByRole('button', { name: /Modell.*abgeschlossen/ }))
    expect(onStepSelect).toHaveBeenCalledWith(0)
  })

  it('should not render future incomplete steps as buttons when they are unreachable', () => {
    render(<ConfiguratorStepper steps={steps} currentStep={2} onStepSelect={vi.fn()} labels={labels} />)
    expect(screen.queryByRole('button', { name: /Felgen/ })).not.toBeInTheDocument()
  })
})

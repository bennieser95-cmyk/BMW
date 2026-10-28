import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { ConsentBanner } from './consent-banner'

import type { ConsentDecision } from './consent-banner'

const labels = {
  title: 'Datenschutzeinstellungen',
  description: 'Wir verwenden Cookies.',
  accept: 'Alle akzeptieren',
  reject: 'Ablehnen',
  settings: 'Einstellungen',
  save: 'Auswahl speichern',
}
const categories = [
  { id: 'necessary', label: 'Notwendig', required: true },
  { id: 'statistics', label: 'Statistik', description: 'Anonyme Reichweitenmessung' },
]

function Harness({ onDecision }: { onDecision: (decision: ConsentDecision) => void }) {
  const [value, setValue] = useState<Record<string, boolean>>({})
  return (
    <ConsentBanner
      categories={categories}
      value={value}
      onChange={(id, granted) => setValue((current) => ({ ...current, [id]: granted }))}
      onDecision={onDecision}
      labels={labels}
    />
  )
}

describe('ConsentBanner', () => {
  it('should offer accept and reject with equal prominence when shown', () => {
    render(<Harness onDecision={vi.fn()} />)
    const accept = screen.getByRole('button', { name: 'Alle akzeptieren' })
    const reject = screen.getByRole('button', { name: 'Ablehnen' })
    expect(accept.className).toBe(reject.className)
  })

  it('should report reject-all when reject is pressed', async () => {
    const onDecision = vi.fn()
    render(<Harness onDecision={onDecision} />)
    await userEvent.click(screen.getByRole('button', { name: 'Ablehnen' }))
    expect(onDecision).toHaveBeenCalledWith('reject-all')
  })

  it('should allow granular choices and save when settings are opened', async () => {
    const onDecision = vi.fn()
    render(<Harness onDecision={onDecision} />)
    await userEvent.click(screen.getByRole('button', { name: 'Einstellungen' }))
    expect(screen.getByRole('checkbox', { name: 'Notwendig' })).toBeDisabled()
    const statistics = screen.getByRole('checkbox', { name: 'Statistik' })
    await userEvent.click(statistics)
    expect(statistics).toBeChecked()
    await userEvent.click(screen.getByRole('button', { name: 'Auswahl speichern' }))
    expect(onDecision).toHaveBeenCalledWith('save')
  })

  it('should have no axe violations when settings are open', async () => {
    const { container } = render(<Harness onDecision={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: 'Einstellungen' }))
    expect(await axe(container)).toHaveNoViolations()
  })
})

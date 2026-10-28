import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { describe, expect, it, vi } from 'vitest'

import { Button } from './button'

describe('Button', () => {
  it('should call onClick when clicked', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Konfigurieren</Button>)
    await userEvent.click(screen.getByRole('button', { name: 'Konfigurieren' }))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('should default to type button when no type is given', () => {
    render(<Button>Weiter</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })

  it('should be disabled and busy when loading', async () => {
    const onClick = vi.fn()
    render(
      <Button loading loadingLabel="Wird gesendet" onClick={onClick}>
        Senden
      </Button>,
    )
    const button = screen.getByRole('button', { name: /Senden/ })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByRole('status')).toHaveTextContent('Wird gesendet')
    await userEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('should render the child element when asChild is set', () => {
    render(
      <Button asChild variant="secondary">
        <a href="https://example.com/modelle">Modelle</a>
      </Button>,
    )
    const link = screen.getByRole('link', { name: 'Modelle' })
    expect(link).toHaveAttribute('href', 'https://example.com/modelle')
    expect(link).not.toHaveAttribute('type')
  })

  it('should receive keyboard focus when tabbing', async () => {
    render(<Button>Fokus</Button>)
    await userEvent.tab()
    expect(screen.getByRole('button')).toHaveFocus()
  })

  it('should have no axe violations when rendered in all variants', async () => {
    const { container } = render(
      <div>
        <Button>Primär</Button>
        <Button variant="secondary">Sekundär</Button>
        <Button variant="ghost">Ghost</Button>
        <Button disabled>Deaktiviert</Button>
        <Button size="icon" aria-label="Menü">
          ☰
        </Button>
      </div>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

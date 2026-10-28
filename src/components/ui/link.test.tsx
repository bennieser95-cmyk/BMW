import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { describe, expect, it } from 'vitest'

import { Link } from './link'

describe('Link', () => {
  it('should render an internal anchor when external is not set', () => {
    render(<Link href="/de-de/haendler">Händlersuche</Link>)
    const link = screen.getByRole('link', { name: 'Händlersuche' })
    expect(link).toHaveAttribute('href', '/de-de/haendler')
    expect(link).not.toHaveAttribute('target')
  })

  it('should open safely in a new tab and announce it when external', () => {
    render(
      <Link href="https://example.com" external externalLabel="öffnet in neuem Tab">
        Partner
      </Link>,
    )
    const link = screen.getByRole('link', { name: /Partner.*öffnet in neuem Tab/ })
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('should have no axe violations when rendered', async () => {
    const { container } = render(
      <p>
        <Link href="/a" underline="always">
          Intern
        </Link>{' '}
        <Link href="https://example.com" external externalLabel="öffnet in neuem Tab">
          Extern
        </Link>
      </p>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

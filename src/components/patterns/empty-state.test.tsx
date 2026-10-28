import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { describe, expect, it } from 'vitest'

import { Button } from '@/components/ui/button'

import { EmptyState } from './empty-state'

describe('EmptyState', () => {
  it('should announce the empty result as a status with a recovery action when rendered', async () => {
    const { container } = render(
      <EmptyState
        title="Keine Treffer"
        description="Passen Sie die Filter an."
        action={<Button variant="secondary">Filter zurücksetzen</Button>}
      />,
    )
    expect(screen.getByRole('status')).toHaveTextContent('Keine Treffer')
    expect(screen.getByRole('button', { name: 'Filter zurücksetzen' })).toBeInTheDocument()
    expect(await axe(container)).toHaveNoViolations()
  })
})

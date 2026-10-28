import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Icon } from './icon'

describe('Icon', () => {
  it('should be hidden from assistive technology when no label is given', () => {
    const { container } = render(<Icon name="search" />)
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  it('should expose an image role with the label when a label is given', () => {
    render(<Icon name="search" label="Suche" />)
    expect(screen.getByRole('img', { name: 'Suche' })).toBeInTheDocument()
  })
})

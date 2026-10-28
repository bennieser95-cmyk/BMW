import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { describe, expect, it } from 'vitest'

import { ModelCarousel } from './model-carousel'

const labels = {
  carousel: 'Modellkarussell',
  previous: 'Vorheriges Modell',
  next: 'Nächstes Modell',
  goTo: 'Gehe zu Modell {index}',
  slideOf: '{current} von {total}',
  pause: 'Automatische Wiedergabe pausieren',
  play: 'Automatische Wiedergabe starten',
}
const items = ['A', 'B', 'C'].map((name) => ({ id: name, content: <p>Modell {name}</p> }))

describe('ModelCarousel', () => {
  it('should not render an autoplay control when autoplay is off by default', () => {
    render(<ModelCarousel items={items} labels={labels} />)
    expect(screen.queryByRole('button', { name: labels.pause })).not.toBeInTheDocument()
  })

  it('should mark the next pagination item as current when next is pressed', async () => {
    render(<ModelCarousel items={items} labels={labels} />)
    await userEvent.click(screen.getByRole('button', { name: 'Nächstes Modell' }))
    expect(screen.getByRole('button', { name: 'Gehe zu Modell 2' })).toHaveAttribute('aria-current', 'true')
  })

  it('should wrap to the last slide when previous is pressed on the first slide', async () => {
    render(<ModelCarousel items={items} labels={labels} />)
    await userEvent.click(screen.getByRole('button', { name: 'Vorheriges Modell' }))
    expect(screen.getByRole('button', { name: 'Gehe zu Modell 3' })).toHaveAttribute('aria-current', 'true')
  })

  it('should move with arrow keys when the track has focus', async () => {
    const { container } = render(<ModelCarousel items={items} labels={labels} />)
    container.querySelector<HTMLElement>('[tabindex="0"]')?.focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(screen.getByRole('button', { name: 'Gehe zu Modell 2' })).toHaveAttribute('aria-current', 'true')
  })

  it('should toggle between pause and play when autoplay is enabled', async () => {
    render(<ModelCarousel items={items} labels={labels} autoplay />)
    await userEvent.click(screen.getByRole('button', { name: labels.pause }))
    expect(screen.getByRole('button', { name: labels.play })).toBeInTheDocument()
  })

  it('should have no axe violations when rendered', async () => {
    const { container } = render(<ModelCarousel items={items} labels={labels} autoplay />)
    expect(await axe(container)).toHaveNoViolations()
  })
})

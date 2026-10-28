import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { describe, expect, it } from 'vitest'

import { MediaGallery } from './media-gallery'

import type { GalleryItem } from './media-gallery.types'

const items: GalleryItem[] = [
  { id: 'front', media: { type: 'placeholder', variant: 1, alt: 'Frontansicht' }, caption: 'Front' },
  { id: 'side', media: { type: 'placeholder', variant: 2, alt: 'Seitenansicht' } },
  { id: 'rear', media: { type: 'placeholder', variant: 3, alt: 'Heckansicht' } },
]
const labels = {
  open: 'Bild vergrößern',
  dialog: 'Bildansicht',
  close: 'Schließen',
  previous: 'Vorheriges Bild',
  next: 'Nächstes Bild',
  counter: 'Bild {current} von {total}',
}

describe('MediaGallery with Lightbox', () => {
  it('should open the lightbox at the clicked image when a thumbnail is pressed', async () => {
    render(<MediaGallery items={items} labels={labels} />)
    await userEvent.click(screen.getByRole('button', { name: 'Bild vergrößern: Seitenansicht' }))
    expect(within(screen.getByRole('dialog')).getByText('Bild 2 von 3')).toBeInTheDocument()
  })

  it('should navigate with arrow keys and wrap around when the lightbox is open', async () => {
    render(<MediaGallery items={items} labels={labels} />)
    await userEvent.click(screen.getByRole('button', { name: 'Bild vergrößern: Heckansicht' }))
    await userEvent.keyboard('{ArrowRight}')
    expect(screen.getByText('Bild 1 von 3')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Vorheriges Bild' }))
    expect(screen.getByText('Bild 3 von 3')).toBeInTheDocument()
  })

  it('should trap focus inside the lightbox when tabbing', async () => {
    render(<MediaGallery items={items} labels={labels} />)
    await userEvent.click(screen.getByRole('button', { name: 'Bild vergrößern: Frontansicht' }))
    const dialog = screen.getByRole('dialog')
    for (let i = 0; i < 5; i += 1) {
      await userEvent.tab()
      expect(dialog).toContainElement(document.activeElement as HTMLElement)
    }
  })

  it('should return focus to the thumbnail when closed with Escape', async () => {
    render(<MediaGallery items={items} labels={labels} />)
    const thumb = screen.getByRole('button', { name: 'Bild vergrößern: Seitenansicht' })
    await userEvent.click(thumb)
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(thumb).toHaveFocus()
  })

  it('should have no axe violations when the lightbox is open', async () => {
    render(<MediaGallery items={items} labels={labels} />)
    expect(await axe(document.body)).toHaveNoViolations()
    await userEvent.click(screen.getByRole('button', { name: 'Bild vergrößern: Frontansicht' }))
    expect(await axe(document.body)).toHaveNoViolations()
  })
})

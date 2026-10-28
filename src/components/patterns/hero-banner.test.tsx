import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { HeroBanner } from './hero-banner'

const videoLabels = { pause: 'Video pausieren', play: 'Video abspielen' }
const media = {
  type: 'video' as const,
  src: '/media/hero.mp4',
  poster: { type: 'placeholder' as const, variant: 1 as const, alt: 'Fahrzeug bei Nacht' },
}

function setReducedMotion(matches: boolean) {
  vi.spyOn(window, 'matchMedia').mockImplementation(
    (query: string) =>
      ({
        matches: query.includes('reduce') ? matches : false,
        media: query,
        onchange: null,
        addListener: () => undefined,
        removeListener: () => undefined,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        dispatchEvent: () => false,
      }) as MediaQueryList,
  )
}

describe('HeroBanner', () => {
  afterEach(() => vi.restoreAllMocks())

  it('should render a single h1 and the CTAs as links when given', async () => {
    const { container } = render(
      <HeroBanner
        media={{ type: 'placeholder', variant: 2, alt: '' }}
        eyebrow="Neu"
        headline="Die neue Limousine"
        cta={{ primary: { label: 'Konfigurieren', href: '/de-de/konfigurator/l7' }, secondary: { label: 'Entdecken', href: '/de-de/modelle' } }}
      />,
    )
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByRole('link', { name: 'Konfigurieren' })).toHaveAttribute('href', '/de-de/konfigurator/l7')
    expect(await axe(container)).toHaveNoViolations()
  })

  it('should play the video with a pause control when the window has loaded', async () => {
    setReducedMotion(false)
    vi.spyOn(HTMLMediaElement.prototype, 'paused', 'get').mockReturnValue(false)
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined)
    const { container } = render(<HeroBanner media={media} headline="Elektrisch" videoLabels={videoLabels} />)
    act(() => window.dispatchEvent(new Event('load')))
    expect(container.querySelector('video')).not.toBeNull()
    await userEvent.click(screen.getByRole('button', { name: 'Video pausieren' }))
    expect(screen.getByRole('button', { name: 'Video abspielen' })).toBeInTheDocument()
  })

  it('should not load the video when reduced motion is preferred', () => {
    setReducedMotion(true)
    const { container } = render(<HeroBanner media={media} headline="Elektrisch" videoLabels={videoLabels} />)
    act(() => window.dispatchEvent(new Event('load')))
    expect(container.querySelector('video')).toBeNull()
  })
})

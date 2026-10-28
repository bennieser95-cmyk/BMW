'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { usePrefersReducedMotion } from '@/components/hooks/use-prefers-reduced-motion'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/cn'
import { formatLabel } from '@/lib/format-label'

import type { KeyboardEvent, ReactNode } from 'react'

export interface CarouselItem {
  id: string
  content: ReactNode
}

export interface ModelCarouselLabels {
  carousel: string
  previous: string
  next: string
  /** Template with {index}, e.g. "Gehe zu Modell {index}". */
  goTo: string
  /** Template with {current} and {total}, e.g. "{current} von {total}". */
  slideOf: string
  pause: string
  play: string
}

export interface ModelCarouselProps {
  items: CarouselItem[]
  labels: ModelCarouselLabels
  /** Off by default (BAV-UX-007 5.2); never runs when reduced motion is preferred. */
  autoplay?: boolean
  autoplayIntervalMs?: number
  className?: string
}

/**
 * Scroll-snap carousel (APG carousel pattern): native swipe, arrow keys, prev/next buttons,
 * visible pagination. Autoplay pauses on hover/focus and via an explicit pause button.
 */
export function ModelCarousel({
  items,
  labels,
  autoplay = false,
  autoplayIntervalMs = 6000,
  className,
}: ModelCarouselProps) {
  const trackRef = useRef<HTMLUListElement>(null)
  const [current, setCurrent] = useState(0)
  const [playing, setPlaying] = useState(autoplay)
  const [interacting, setInteracting] = useState(false)
  const reducedMotion = usePrefersReducedMotion()
  const total = items.length

  const goTo = useCallback(
    (index: number) => {
      const track = trackRef.current
      const target = track?.children[(index + total) % total] as HTMLElement | undefined
      if (!track || !target) return
      track.scrollTo({ left: target.offsetLeft - track.offsetLeft, behavior: reducedMotion ? 'auto' : 'smooth' })
      setCurrent((index + total) % total)
    },
    [reducedMotion, total],
  )

  // Syncs the active index with native scrolling (swipe, trackpad).
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting)
        if (visible) setCurrent(Array.from(track.children).indexOf(visible.target))
      },
      { root: track, threshold: 0.6 },
    )
    Array.from(track.children).forEach((child) => observer.observe(child))
    return () => observer.disconnect()
  }, [items])

  const isAutoplaying = autoplay && playing && !interacting && !reducedMotion
  useEffect(() => {
    if (!isAutoplaying) return
    const timer = setInterval(() => goTo(current + 1), autoplayIntervalMs)
    return () => clearInterval(timer)
  }, [isAutoplaying, autoplayIntervalMs, current, goTo])

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowRight') goTo(current + 1)
    else if (event.key === 'ArrowLeft') goTo(current - 1)
    else return
    event.preventDefault()
  }

  return (
    <section
      aria-roledescription="carousel"
      aria-label={labels.carousel}
      className={cn('flex flex-col gap-4', className)}
      onPointerEnter={() => setInteracting(true)}
      onPointerLeave={() => setInteracting(false)}
      onFocus={() => setInteracting(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setInteracting(false)
      }}
    >
      <ul
        ref={trackRef}
        // Scrollable region must be keyboard reachable (axe scrollable-region-focusable).
        tabIndex={0}
        onKeyDown={onKeyDown}
        aria-live={isAutoplaying ? 'off' : 'polite'}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none]"
      >
        {items.map((item, index) => (
          <li
            key={item.id}
            role="group"
            aria-roledescription="slide"
            aria-label={formatLabel(labels.slideOf, { current: index + 1, total })}
            className="shrink-0 basis-full snap-start md:basis-1/2 lg:basis-1/3"
          >
            {item.content}
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between gap-4">
        <ol className="flex flex-wrap items-center">
          {items.map((item, index) => (
            <li key={item.id}>
              <button
                type="button"
                aria-label={formatLabel(labels.goTo, { index: index + 1 })}
                aria-current={index === current ? 'true' : undefined}
                onClick={() => goTo(index)}
                className="group flex size-touch items-center justify-center"
              >
                <span
                  className={cn(
                    'block h-1 w-6 rounded-pill transition-transform duration-(--motion-fast) ease-standard',
                    index === current ? 'scale-x-150 bg-text' : 'bg-border-strong group-hover:bg-text-muted',
                  )}
                />
              </button>
            </li>
          ))}
        </ol>
        <div className="flex items-center gap-2">
          {autoplay && !reducedMotion ? (
            <Button
              variant="secondary"
              size="icon"
              aria-label={playing ? labels.pause : labels.play}
              onClick={() => setPlaying((value) => !value)}
            >
              <Icon name={playing ? 'pause' : 'play'} />
            </Button>
          ) : null}
          <Button variant="secondary" size="icon" aria-label={labels.previous} onClick={() => goTo(current - 1)}>
            <Icon name="chevron-left" className="rtl:rotate-180" />
          </Button>
          <Button variant="secondary" size="icon" aria-label={labels.next} onClick={() => goTo(current + 1)}>
            <Icon name="chevron-right" className="rtl:rotate-180" />
          </Button>
        </div>
      </div>
    </section>
  )
}

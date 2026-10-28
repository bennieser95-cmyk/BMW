'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { useRef } from 'react'

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Media } from '@/components/ui/media'
import { formatLabel } from '@/lib/format-label'

import type { GalleryItem } from './media-gallery.types'
import type { KeyboardEvent, PointerEvent } from 'react'

export interface LightboxLabels {
  dialog: string
  close: string
  previous: string
  next: string
  /** Template with {current} and {total}. */
  counter: string
}

export interface LightboxProps {
  items: GalleryItem[]
  /** Index of the shown item; null closes the lightbox. */
  index: number | null
  onIndexChange: (index: number | null) => void
  labels: LightboxLabels
}

const SWIPE_THRESHOLD_PX = 48

/**
 * Modal image viewer. Radix Dialog traps focus, closes on Esc and returns focus to the
 * thumbnail that opened it (BAV-UX-007 5.3).
 */
export function Lightbox({ items, index, onIndexChange, labels }: LightboxProps) {
  const pointerStartX = useRef<number | null>(null)
  // No Dialog.Trigger exists (thumbnails open it), so Radix cannot restore focus by itself.
  const returnFocusTo = useRef<HTMLElement | null>(null)
  const total = items.length
  const item = index === null ? undefined : items[index]

  const step = (delta: number) => {
    if (index !== null) onIndexChange((index + delta + total) % total)
  }

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowRight') step(1)
    else if (event.key === 'ArrowLeft') step(-1)
  }

  const onPointerUp = (event: PointerEvent) => {
    if (pointerStartX.current === null) return
    const delta = event.clientX - pointerStartX.current
    pointerStartX.current = null
    if (Math.abs(delta) >= SWIPE_THRESHOLD_PX) step(delta < 0 ? 1 : -1)
  }

  return (
    <Dialog.Root
      open={item !== undefined}
      onOpenChange={(open) => (open ? undefined : onIndexChange(null))}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="bg-overlay motion-safe:animate-fade-in fixed inset-0 z-(--z-modal)" />
        <Dialog.Content
          aria-describedby={undefined}
          onOpenAutoFocus={() => {
            returnFocusTo.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
          }}
          onCloseAutoFocus={(event) => {
            if (!returnFocusTo.current?.isConnected) return
            event.preventDefault()
            returnFocusTo.current.focus()
          }}
          onKeyDown={onKeyDown}
          className="text-on-media fixed inset-0 z-(--z-modal) flex flex-col"
        >
          <div className="flex items-center justify-between gap-4 p-4">
            <Dialog.Title className="text-sm" aria-live="polite">
              {labels.dialog}
              {index === null ? null : (
                <span className="ms-2 tabular-nums">
                  {formatLabel(labels.counter, { current: index + 1, total })}
                </span>
              )}
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={labels.close}
                className="text-on-media"
              >
                <Icon name="close" />
              </Button>
            </Dialog.Close>
          </div>
          <div
            className="relative flex-1 touch-pan-y"
            onPointerDown={(event) => {
              pointerStartX.current = event.clientX
            }}
            onPointerUp={onPointerUp}
          >
            {item ? (
              <figure className="absolute inset-4 m-0 flex flex-col">
                <div className="relative flex-1">
                  <Media media={item.media} sizes="100vw" className="object-contain" />
                </div>
                {item.caption ? (
                  <figcaption className="pt-2 text-center text-sm">{item.caption}</figcaption>
                ) : null}
              </figure>
            ) : null}
          </div>
          {total > 1 ? (
            <div className="flex justify-center gap-4 p-4">
              <Button
                variant="secondary"
                size="icon"
                aria-label={labels.previous}
                onClick={() => step(-1)}
                className="border-on-media text-on-media hover:bg-overlay"
              >
                <Icon name="chevron-left" className="rtl:rotate-180" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                aria-label={labels.next}
                onClick={() => step(1)}
                className="border-on-media text-on-media hover:bg-overlay"
              >
                <Icon name="chevron-right" className="rtl:rotate-180" />
              </Button>
            </div>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

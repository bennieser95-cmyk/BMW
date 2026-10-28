'use client'

import { useState } from 'react'

import { Icon } from '@/components/ui/icon'
import { Media } from '@/components/ui/media'
import { cn } from '@/lib/cn'
import { formatLabel } from '@/lib/format-label'

import { Lightbox } from './lightbox'

import type { LightboxLabels } from './lightbox'
import type { GalleryItem } from './media-gallery.types'

export interface MediaGalleryProps {
  items: GalleryItem[]
  labels: LightboxLabels & { open: string }
  /** Opens the lightbox at this index on mount (deep links such as ?bild=3). */
  startIndex?: number
  className?: string
}

/** Image grid; each thumbnail is a button that opens the lightbox at its position. */
export function MediaGallery({ items, labels, startIndex, className }: MediaGalleryProps) {
  const [index, setIndex] = useState<number | null>(startIndex ?? null)

  return (
    <>
      <ul className={cn('grid grid-cols-2 gap-2 lg:grid-cols-3', className)}>
        {items.map((item, itemIndex) => (
          <li key={item.id} className={cn(itemIndex === 0 && 'col-span-2 row-span-2')}>
            <button
              type="button"
              onClick={() => setIndex(itemIndex)}
              aria-label={`${labels.open}: ${item.media.alt || formatLabel(labels.counter, { current: itemIndex + 1, total: items.length })}`}
              className="group bg-surface relative block aspect-video w-full overflow-hidden rounded-sm"
            >
              <Media
                media={item.media}
                sizes={
                  itemIndex === 0
                    ? '(min-width: 64rem) 66vw, 100vw'
                    : '(min-width: 64rem) 33vw, 50vw'
                }
                className="ease-standard transition-transform duration-(--motion-slow) group-hover:scale-105"
              />
              <span className="bg-overlay text-on-media absolute end-2 bottom-2 rounded-sm p-1 opacity-0 transition-opacity duration-(--motion-fast) group-hover:opacity-100 group-focus-visible:opacity-100">
                <Icon name="zoom-in" size="sm" />
              </span>
            </button>
          </li>
        ))}
      </ul>
      <Lightbox items={items} index={index} onIndexChange={setIndex} labels={labels} />
    </>
  )
}

import Image from 'next/image'

import { cn } from '@/lib/cn'

import type { StillMedia } from './media.types'

export interface MediaProps {
  media: StillMedia
  /** Required for responsive images, e.g. "(min-width: 64rem) 33vw, 100vw". */
  sizes: string
  /** Preloads the LCP image (hero, first card). */
  preload?: boolean
  className?: string
}

const PLACEHOLDER_CLASSES = {
  1: 'media-placeholder-1',
  2: 'media-placeholder-2',
  3: 'media-placeholder-3',
  4: 'media-placeholder-4',
} as const

/** Fills its (positioned, aspect-ratio) parent with an image or a gradient placeholder. */
export function Media({ media, sizes, preload = false, className }: MediaProps) {
  if (media.type === 'placeholder') {
    const a11y = media.alt ? { role: 'img', 'aria-label': media.alt } : { 'aria-hidden': true }
    return (
      <div
        {...a11y}
        className={cn('absolute inset-0', PLACEHOLDER_CLASSES[media.variant], className)}
      />
    )
  }

  return (
    <Image
      src={media.src}
      alt={media.alt}
      width={media.width}
      height={media.height}
      sizes={sizes}
      preload={preload}
      // SVG placeholders are already resolution-independent; the optimiser rejects them by default.
      unoptimized={media.src.endsWith('.svg')}
      className={cn('absolute inset-0 size-full object-cover', className)}
    />
  )
}

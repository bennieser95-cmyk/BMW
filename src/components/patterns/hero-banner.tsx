import NextLink from 'next/link'

import { Button } from '@/components/ui/button'
import { Media } from '@/components/ui/media'
import type { HeroMedia } from '@/components/ui/media.types'
import { cn } from '@/lib/cn'

import { HeroVideo } from './hero-video'


export interface HeroCta {
  label: string
  href: string
}

export interface HeroBannerProps {
  media: HeroMedia
  headline: string
  eyebrow?: string
  body?: string
  /** Primary and optional secondary call to action. */
  cta?: { primary: HeroCta; secondary?: HeroCta }
  align?: 'start' | 'center'
  /** Required when media is a video: labels of the pause/play control. */
  videoLabels?: { pause: string; play: string }
}

/**
 * Full-viewport hero (100svh). Text sits in the lower half on top of the scrim, which keeps
 * on-media text >= 4.5:1 even over a white photo (see docs/design-system/contrast.md).
 */
export function HeroBanner({
  media,
  headline,
  eyebrow,
  body,
  cta,
  align = 'start',
  videoLabels,
}: HeroBannerProps) {
  const still = media.type === 'video' ? media.poster : media

  return (
    <section className="relative isolate flex min-h-svh items-end overflow-hidden bg-text text-on-media">
      <Media media={still} sizes="100vw" preload />
      {media.type === 'video' && videoLabels ? <HeroVideo src={media.src} labels={videoLabels} /> : null}
      <div aria-hidden="true" className="media-scrim absolute inset-0" />
      <div
        className={cn(
          'layout-container relative flex flex-col gap-4 pb-24 lg:pb-32',
          align === 'center' && 'items-center text-center',
        )}
      >
        {eyebrow ? <p className="text-sm font-medium tracking-wide uppercase">{eyebrow}</p> : null}
        <h1 className="max-w-prose">{headline}</h1>
        {body ? <p className="max-w-prose text-lg">{body}</p> : null}
        {cta ? (
          <div className="mt-4 flex flex-wrap gap-4">
            <Button asChild size="lg">
              <NextLink href={cta.primary.href}>{cta.primary.label}</NextLink>
            </Button>
            {cta.secondary ? (
              <Button asChild size="lg" variant="secondary" className="border-on-media text-on-media hover:bg-overlay">
                <NextLink href={cta.secondary.href}>{cta.secondary.label}</NextLink>
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  )
}

'use client'

import { useRef, useState, useSyncExternalStore } from 'react'

import { usePrefersReducedMotion } from '@/components/hooks/use-prefers-reduced-motion'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'

export interface HeroVideoProps {
  src: string
  labels: { pause: string; play: string }
}

function subscribeToWindowLoad(onLoad: () => void): () => void {
  window.addEventListener('load', onLoad, { once: true })
  return () => window.removeEventListener('load', onLoad)
}

function isWindowLoaded(): boolean {
  return document.readyState === 'complete'
}

/**
 * Background video that only loads after the window load event (i.e. after LCP, BAV-UX-007
 * 5.2) and never autoplays for users who prefer reduced motion. Moving content longer than
 * 5 s needs a pause control (WCAG 2.2.2).
 */
export function HeroVideo({ src, labels }: HeroVideoProps) {
  const reducedMotion = usePrefersReducedMotion()
  const canLoad = useSyncExternalStore(subscribeToWindowLoad, isWindowLoaded, () => false)
  const [playing, setPlaying] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  if (!canLoad || reducedMotion) return null

  const toggle = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      void video.play()
      setPlaying(true)
    } else {
      video.pause()
      setPlaying(false)
    }
  }

  return (
    <>
      <video
        ref={videoRef}
        src={src}
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
        className="motion-safe:animate-fade-in absolute inset-0 size-full object-cover"
      />
      <Button
        variant="secondary"
        size="icon"
        onClick={toggle}
        aria-label={playing ? labels.pause : labels.play}
        className="border-on-media text-on-media hover:bg-overlay absolute end-4 bottom-4 z-1"
      >
        <Icon name={playing ? 'pause' : 'play'} />
      </Button>
    </>
  )
}

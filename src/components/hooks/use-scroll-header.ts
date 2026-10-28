'use client'

import { useEffect, useState } from 'react'

/** Matches --header-scroll-threshold in tokens.css (BAV-UX-007 5.1). */
export const HEADER_SOLID_THRESHOLD_PX = 80
const DIRECTION_TOLERANCE_PX = 8

export interface ScrollHeaderState {
  /** Past the threshold: header switches from transparent to solid surface. */
  isSolid: boolean
  /** Scrolling down past the threshold: header slides out (FR-NAV-004). */
  isHidden: boolean
}

/**
 * Tracks scroll position and direction for the header. `locked` keeps the header visible while
 * a menu is open or focus is inside it, so keyboard users never lose the focused element.
 */
export function useScrollHeader(locked: boolean): ScrollHeaderState {
  const [state, setState] = useState<ScrollHeaderState>({ isSolid: false, isHidden: false })

  useEffect(() => {
    let lastY = window.scrollY
    let frame = 0

    const update = () => {
      frame = 0
      const y = window.scrollY
      const delta = y - lastY
      if (Math.abs(delta) < DIRECTION_TOLERANCE_PX && y > HEADER_SOLID_THRESHOLD_PX) return
      const isSolid = y > HEADER_SOLID_THRESHOLD_PX
      const isHidden = !locked && isSolid && delta > 0
      lastY = y
      setState((prev) =>
        prev.isSolid === isSolid && prev.isHidden === isHidden ? prev : { isSolid, isHidden },
      )
    }

    // rAF throttling keeps the scroll listener off the main thread's critical path (INP).
    const onScroll = () => {
      if (frame === 0) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame !== 0) cancelAnimationFrame(frame)
    }
  }, [locked])

  return locked ? { ...state, isHidden: false } : state
}

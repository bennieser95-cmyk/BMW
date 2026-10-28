'use client'

import { useCallback, useEffect, useRef } from 'react'

/** Matches --hover-intent-delay in tokens.css (BAV-UX-007 5.1). */
export const HOVER_INTENT_DELAY_MS = 150

/**
 * Delays an action until the pointer has rested for the intent delay, so menus do not flicker
 * open when the cursor merely passes over a trigger.
 */
export function useHoverIntent(delayMs: number = HOVER_INTENT_DELAY_MS) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cancel = useCallback(() => {
    if (timer.current !== null) {
      clearTimeout(timer.current)
      timer.current = null
    }
  }, [])

  const schedule = useCallback(
    (action: () => void) => {
      cancel()
      timer.current = setTimeout(action, delayMs)
    },
    [cancel, delayMs],
  )

  useEffect(() => cancel, [cancel])

  return { schedule, cancel }
}

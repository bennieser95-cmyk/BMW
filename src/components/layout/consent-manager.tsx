'use client'

import { useEffect, useState } from 'react'
import { z } from 'zod'

import { ConsentBanner } from '@/components/patterns/consent-banner'
import type { ConsentDecision } from '@/components/patterns/consent-banner'
import { track } from '@/lib/track'


export const OPEN_CONSENT_EVENT = 'bavaria:open-consent'

const consentSchema = z.object({
  necessary: z.literal(true),
  statistics: z.boolean(),
  marketing: z.boolean(),
  savedAt: z.number(),
})

const CONSENT_KEY = 'bavaria-consent'
const CONSENT_MAX_AGE_S = 183 * 24 * 60 * 60

export interface ConsentManagerProps {
  labels: {
    title: string
    description: string
    accept: string
    reject: string
    settings: string
    save: string
    necessary: string
    statistics: string
    marketing: string
  }
}

function hasValidStoredConsent(): boolean {
  const stored = window.localStorage.getItem(CONSENT_KEY)
  if (!stored) return false
  try {
    const consent = consentSchema.safeParse(JSON.parse(stored))
    return consent.success && Date.now() - consent.data.savedAt < CONSENT_MAX_AGE_S * 1000
  } catch {
    window.localStorage.removeItem(CONSENT_KEY)
    return false
  }
}

/**
 * Container around the presentational ConsentBanner: owns persistence (localStorage + cookie
 * for the server), the re-open event from the footer and the consent_updated tracking event.
 */
export function ConsentManager({ labels }: ConsentManagerProps) {
  const [visible, setVisible] = useState(false)
  const [choice, setChoice] = useState<Record<string, boolean>>({ statistics: false, marketing: false })

  useEffect(() => {
    const open = () => setVisible(true)
    window.addEventListener(OPEN_CONSENT_EVENT, open)
    // Deferred to the next frame: storage is client-only and must not cause a hydration mismatch.
    const frame = window.requestAnimationFrame(() => setVisible(!hasValidStoredConsent()))
    return () => {
      window.removeEventListener(OPEN_CONSENT_EVENT, open)
      window.cancelAnimationFrame(frame)
    }
  }, [])

  const save = (statistics: boolean, marketing: boolean) => {
    const consent = { necessary: true as const, statistics, marketing, savedAt: Date.now() }
    window.localStorage.setItem(CONSENT_KEY, JSON.stringify(consent))
    document.cookie = `${CONSENT_KEY}=${encodeURIComponent(JSON.stringify(consent))}; Max-Age=${CONSENT_MAX_AGE_S}; Path=/; SameSite=Lax`
    setVisible(false)
    window.dispatchEvent(new CustomEvent('bavaria:consent-updated', { detail: consent }))
    track('consent_updated', {
      categories: ['necessary', ...(statistics ? ['statistics'] : []), ...(marketing ? ['marketing'] : [])],
    })
  }

  const onDecision = (decision: ConsentDecision) => {
    if (decision === 'accept-all') save(true, true)
    else if (decision === 'reject-all') save(false, false)
    else save(choice.statistics === true, choice.marketing === true)
  }

  if (!visible) return null

  return (
    <ConsentBanner
      categories={[
        { id: 'necessary', label: labels.necessary, required: true },
        { id: 'statistics', label: labels.statistics },
        { id: 'marketing', label: labels.marketing },
      ]}
      value={choice}
      onChange={(id, granted) => setChoice((current) => ({ ...current, [id]: granted }))}
      onDecision={onDecision}
      labels={labels}
    />
  )
}

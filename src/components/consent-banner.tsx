'use client'

import { useEffect, useState } from 'react'
import { z } from 'zod'

import { getMessages } from '@/lib/messages'
import { track } from '@/lib/track'

const consentSchema = z.object({
  necessary: z.literal(true),
  statistics: z.boolean(),
  marketing: z.boolean(),
  savedAt: z.number(),
})

const CONSENT_KEY = 'bavaria-consent'
const CONSENT_MAX_AGE = 183 * 24 * 60 * 60 * 1000

export function ConsentBanner({ locale }: { locale: string }) {
  const messages = getMessages(locale)
  const [visible, setVisible] = useState(false)
  const [settings, setSettings] = useState(false)
  const [statistics, setStatistics] = useState(false)
  const [marketing, setMarketing] = useState(false)

  useEffect(() => {
    const open = () => setVisible(true)
    window.addEventListener('bavaria:open-consent', open)

    const stored = window.localStorage.getItem(CONSENT_KEY)
    let nextVisible = true

    if (stored) {
      try {
        const consent = consentSchema.safeParse(JSON.parse(stored))
        const hasValidConsent = consent.success && Date.now() - consent.data.savedAt < CONSENT_MAX_AGE
        nextVisible = !hasValidConsent
      } catch {
        window.localStorage.removeItem(CONSENT_KEY)
      }
    }

    window.requestAnimationFrame(() => {
      setVisible(nextVisible)
    })

    return () => window.removeEventListener('bavaria:open-consent', open)
  }, [])

  function saveConsent(allowStatistics: boolean, allowMarketing: boolean) {
    const consent = {
      necessary: true as const,
      statistics: allowStatistics,
      marketing: allowMarketing,
      savedAt: Date.now(),
    }

    window.localStorage.setItem(CONSENT_KEY, JSON.stringify(consent))
    document.cookie = `bavaria-consent=${encodeURIComponent(JSON.stringify(consent))}; Max-Age=${183 * 24 * 60 * 60}; Path=/; SameSite=Lax`
    setVisible(false)
    window.dispatchEvent(new CustomEvent('bavaria:consent-updated', { detail: consent }))
    track('consent_updated', {
      categories: ['necessary', ...(allowStatistics ? ['statistics'] : []), ...(allowMarketing ? ['marketing'] : [])],
    })
  }

  if (!visible) return null

  return (
    <aside aria-labelledby="consent-title" className="consent-panel" role="region">
      <div className="consent-copy">
        <p className="eyebrow">COOKIE-EINSTELLUNGEN</p>
        <h2 id="consent-title">{messages.consent.title}</h2>
        <p>{messages.consent.description}</p>
      </div>

      {settings && (
        <div className="consent-options">
          <label>
            <input checked disabled type="checkbox" />
            {messages.consent.necessary}
          </label>
          <label>
            <input checked={statistics} onChange={(event) => setStatistics(event.target.checked)} type="checkbox" />
            {messages.consent.statistics}
          </label>
          <label>
            <input checked={marketing} onChange={(event) => setMarketing(event.target.checked)} type="checkbox" />
            {messages.consent.marketing}
          </label>
        </div>
      )}

      <div className="consent-actions">
        <button className="button button-secondary" onClick={() => saveConsent(false, false)} type="button">
          {messages.consent.reject}
        </button>
        {settings ? (
          <button className="button button-secondary" onClick={() => saveConsent(statistics, marketing)} type="button">
            {messages.consent.save}
          </button>
        ) : (
          <button className="button button-secondary" onClick={() => setSettings(true)} type="button">
            {messages.consent.settings}
          </button>
        )}
        <button className="button button-primary" onClick={() => saveConsent(true, true)} type="button">
          {messages.consent.accept}
        </button>
      </div>
    </aside>
  )
}
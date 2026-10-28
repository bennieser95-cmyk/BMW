'use client'

import { useState } from 'react'

import { getMessages } from '@/lib/messages'

export function DealerSearchForm({ locale, query }: { locale: string; query: string | undefined }) {
  const messages = getMessages(locale)
  const [locationMessage, setLocationMessage] = useState('')

  function useLocation() {
    if (!navigator.geolocation) {
      setLocationMessage(messages.dealers.locationUnsupported)
      return
    }
    navigator.geolocation.getCurrentPosition(
      () => setLocationMessage(messages.dealers.locationGranted),
      () => setLocationMessage(messages.dealers.locationUnavailable),
      { timeout: 5000 },
    )
  }

  return (
    <form action={`/${locale}/haendler`} className="dealer-search page-container" role="search">
      <label className="field">
        {messages.dealers.postalCode}
        <input autoComplete="postal-code" defaultValue={query} name="q" />
      </label>
      <button className="button button-primary" type="submit">
        {messages.dealers.search}
      </button>
      <button className="button button-secondary" onClick={useLocation} type="button">
        {messages.dealers.location}
      </button>
      {locationMessage && (
        <p aria-live="polite" role="status">
          {locationMessage}
        </p>
      )}
    </form>
  )
}

'use client'

import Link from 'next/link'
import { useEffect } from 'react'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Error reporting is intentionally a stub until Sentry is configured.
    void error.digest
  }, [error])
  return (
    <main className="page-error">
      <p className="eyebrow">BAVARIA / 500</p>
      <h1>Das hat nicht funktioniert.</h1>
      <p>Bitte versuchen Sie es erneut oder kehren Sie zur Startseite zurück.</p>
      <button className="button button-secondary" onClick={reset} type="button">
        Erneut versuchen
      </button>
      <Link className="button button-primary" href="/de-de">
        Zur Startseite
      </Link>
    </main>
  )
}

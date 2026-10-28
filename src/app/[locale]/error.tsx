'use client'

import { useTranslations } from 'next-intl'

interface ErrorBoundaryProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorBoundary({ reset }: ErrorBoundaryProps): React.ReactNode {
  const translate = useTranslations('common')

  return (
    <div className="page-error">
      <h1>{translate('unexpectedError')}</h1>
      <button className="button button-secondary" type="button" onClick={reset}>
        {translate('tryAgain')}
      </button>
    </div>
  )
}

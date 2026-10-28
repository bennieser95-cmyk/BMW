'use client'

import { OPEN_CONSENT_EVENT } from './consent-manager'

export interface ConsentSettingsButtonProps {
  label: string
}

/** Footer entry to revoke or change consent at any time (GDPR Art. 7(3)). */
export function ConsentSettingsButton({ label }: ConsentSettingsButtonProps) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT_EVENT))}
      className="min-h-touch text-text-muted hover:text-text inline-flex items-center text-sm hover:underline"
    >
      {label}
    </button>
  )
}

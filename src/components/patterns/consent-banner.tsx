'use client'

import { useId, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

import type { ReactNode } from 'react'

export interface ConsentCategory {
  id: string
  label: string
  description?: string
  /** Necessary category: always on, cannot be toggled. */
  required?: boolean
}

export type ConsentDecision = 'accept-all' | 'reject-all' | 'save'

export interface ConsentBannerProps {
  categories: ConsentCategory[]
  value: Record<string, boolean>
  onChange: (categoryId: string, granted: boolean) => void
  onDecision: (decision: ConsentDecision) => void
  labels: {
    title: string
    description: string
    accept: string
    reject: string
    settings: string
    save: string
  }
  /** Link to the privacy policy, rendered after the description. */
  policyLink?: ReactNode
}

/**
 * Presentational consent banner (TTDSG/GDPR): "accept" and "reject" are equally prominent and
 * reachable on the first layer. Persistence and tracking are the caller's responsibility.
 */
export function ConsentBanner({
  categories,
  value,
  onChange,
  onDecision,
  labels,
  policyLink,
}: ConsentBannerProps) {
  const [showSettings, setShowSettings] = useState(false)
  const titleId = useId()

  return (
    <section
      aria-labelledby={titleId}
      className="border-border bg-bg text-text shadow-3 motion-safe:animate-fade-in fixed inset-x-0 bottom-0 z-(--z-overlay) border-t"
    >
      <div className="layout-container flex max-h-svh flex-col gap-4 overflow-y-auto py-6">
        <h2 id={titleId} className="text-xl font-medium">
          {labels.title}
        </h2>
        <p className="text-text-muted max-w-prose text-sm">
          {labels.description} {policyLink}
        </p>
        {showSettings ? (
          <fieldset className="flex flex-col gap-1">
            <legend className="sr-only">{labels.settings}</legend>
            {categories.map((category) => (
              <Checkbox
                key={category.id}
                label={category.label}
                {...(category.description ? { hint: category.description } : {})}
                checked={category.required === true || value[category.id] === true}
                disabled={category.required === true}
                onChange={(event) => onChange(category.id, event.currentTarget.checked)}
              />
            ))}
          </fieldset>
        ) : null}
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {/* Same variant for accept and reject: no nudging towards consent. */}
          <Button variant="primary" onClick={() => onDecision('reject-all')}>
            {labels.reject}
          </Button>
          <Button variant="primary" onClick={() => onDecision('accept-all')}>
            {labels.accept}
          </Button>
          {showSettings ? (
            <Button variant="secondary" onClick={() => onDecision('save')}>
              {labels.save}
            </Button>
          ) : (
            <Button variant="secondary" aria-expanded={false} onClick={() => setShowSettings(true)}>
              {labels.settings}
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}

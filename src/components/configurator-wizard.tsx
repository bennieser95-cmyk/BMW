'use client'

import { useEffect, useMemo, useState } from 'react'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import {
  applySelection,
  buildConfigurationCode,
  calculateTotalPrice,
  parseConfigurationCode,
} from '@/domain/configurator/configurator.engine'
import { CONFIGURATOR_OPTIONS } from '@/domain/configurator/configurator.options'
import type { ConfigOption, Configuration } from '@/domain/configurator/configurator.types'
import { formatPrice } from '@/lib/format-price'
import { getMessages } from '@/lib/messages'

const optionGroups: ConfigOption[][] = [
  CONFIGURATOR_OPTIONS.filter(({ category }) => category === 'engine'),
  CONFIGURATOR_OPTIONS.filter(({ category }) => category === 'paint'),
  CONFIGURATOR_OPTIONS.filter(({ category }) => category === 'wheels'),
  CONFIGURATOR_OPTIONS.filter(({ category }) => category === 'interior'),
  CONFIGURATOR_OPTIONS.filter(({ category }) => category === 'package'),
]
const defaultEngine = CONFIGURATOR_OPTIONS.find(({ id }) => id === 'engine-standard')
if (!defaultEngine) throw new Error('The configurator requires a default engine option.')

type WizardState = {
  step: number
  config: Configuration
  setStep: (step: number) => void
  setConfig: (config: Configuration) => void
}
const initialConfig = (modelSlug: string, basePriceCents: number): Configuration => ({
  modelSlug,
  basePriceCents,
  selections: [defaultEngine],
})
const useWizard = create<WizardState>()(
  persist(
    (set) => ({
      step: 0,
      config: initialConfig('aurelia', 4_290_000),
      setStep: (step) => set({ step: Math.max(0, Math.min(5, step)) }),
      setConfig: (config) => set({ config }),
    }),
    {
      name: 'bavaria-configurator',
      storage: createJSONStorage(() => sessionStorage),
      partialize: ({ config, step }) => ({ config, step }) as WizardState,
      skipHydration: true,
    },
  ),
)

const labels: Record<string, readonly [string, string]> = {
  'engine-standard': ['Standard 170 kW', 'Standard 170 kW'],
  'engine-power': ['Leistungsstark 250 kW', 'Power 250 kW'],
  'paint-cloud': ['Cloud White', 'Cloud White'],
  'paint-grey': ['Brooklyn Grey', 'Brooklyn Grey'],
  'paint-red': ['Aurora Red', 'Aurora Red'],
  'wheel-flow': ['Flow 19 Zoll', 'Flow 19 inch'],
  'wheel-sport': ['Sport 20 Zoll', 'Sport 20 inch'],
  'interior-stone': ['Stone Textil', 'Stone textile'],
  'interior-dark': ['Dark Comfort', 'Dark comfort'],
  'package-comfort': ['Komfortpaket', 'Comfort package'],
  'package-track': ['Track Paket', 'Track package'],
}

export function ConfiguratorWizard({
  modelSlug,
  basePriceCents,
  locale,
}: {
  modelSlug: string
  basePriceCents: number
  locale: string
}) {
  const messages = getMessages(locale)
  const { step, config, setStep, setConfig } = useWizard()
  const [verifiedPrice, setVerifiedPrice] = useState<number | null>(null)
  const [priceError, setPriceError] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const groups = useMemo(() => optionGroups, [])
  const configuration =
    config.modelSlug === modelSlug ? config : initialConfig(modelSlug, basePriceCents)

  useEffect(() => {
    let active = true
    void Promise.resolve(useWizard.persist.rehydrate()).then(() => {
      if (!active) return
      const url = new URL(window.location.href)
      const sharedCode = url.searchParams.get('cfg')
      if (sharedCode) {
        const parsed = parseConfigurationCode(sharedCode, CONFIGURATOR_OPTIONS, basePriceCents)
        if (parsed.ok && parsed.value.modelSlug === modelSlug) setConfig(parsed.value)
        else setConfig(initialConfig(modelSlug, basePriceCents))
      } else if (useWizard.getState().config.modelSlug !== modelSlug) {
        setConfig(initialConfig(modelSlug, basePriceCents))
      }
      const requestedStep = Number(url.searchParams.get('step'))
      if (Number.isInteger(requestedStep) && requestedStep >= 0 && requestedStep <= 5)
        setStep(requestedStep)
      setHydrated(true)
    })
    return () => {
      active = false
    }
  }, [basePriceCents, modelSlug, setConfig, setStep])

  useEffect(() => {
    if (!hydrated) return
    const url = new URL(window.location.href)
    url.searchParams.set('cfg', buildConfigurationCode(configuration))
    url.searchParams.set('step', String(step))
    window.history.replaceState({ step }, '', url)
  }, [configuration, hydrated, step])

  useEffect(() => {
    const handlePopState = () => {
      const currentUrl = new URL(window.location.href)
      const previousStep = Number(currentUrl.searchParams.get('step'))
      if (Number.isInteger(previousStep)) setStep(previousStep)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [setStep])

  useEffect(() => {
    if (!hydrated) return
    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch('/api/v1/configurations/price', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            modelSlug,
            optionIds: configuration.selections.map(({ id }) => id),
          }),
          signal: controller.signal,
        })
        if (!response.ok) throw new Error('Price verification failed')
        const result: unknown = await response.json()
        if (
          typeof result === 'object' &&
          result !== null &&
          'totalPriceCents' in result &&
          typeof result.totalPriceCents === 'number'
        ) {
          setVerifiedPrice(result.totalPriceCents)
          setPriceError(false)
        } else throw new Error('Invalid price response')
      } catch {
        if (!controller.signal.aborted) {
          setVerifiedPrice(null)
          setPriceError(true)
        }
      }
    }, 20)
    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [configuration, hydrated, modelSlug])

  function chooseOption(option: ConfigOption) {
    const currentCategory = configuration.selections.filter(
      ({ category }) => category !== option.category,
    )
    const result = applySelection({ ...configuration, selections: currentCategory }, option)
    if (result.ok) setConfig(result.value)
  }

  const price = calculateTotalPrice(configuration)
  const currentOptions = groups[step] ?? []
  const selectedIds = new Set(configuration.selections.map(({ id }) => id))
  const stepNames = messages.configurator.steps
  const displayName = (id: string) => labels[id]?.[locale === 'de-de' ? 0 : 1] ?? id

  return (
    <section className="page-container">
      <ol aria-label="Konfigurationsschritte" className="step-progress">
        {stepNames.map((name, index) => (
          <li aria-current={index === step ? 'step' : undefined} key={name}>
            {index + 1}. {name}
          </li>
        ))}
      </ol>
      <div className="configurator-layout">
        <div
          aria-label={`${modelSlug}, Konfigurationsvorschau`}
          className="configurator-preview"
          role="img"
        >
          <div className="vehicle-art">
            <span>
              {configuration.selections.find(({ category }) => category === 'paint')?.id ??
                modelSlug}
            </span>
          </div>
        </div>
        <div className="configurator-options">
          <h2>{stepNames[step]}</h2>
          {step < 5 ? (
            <div className="option-list">
              {currentOptions.map((option) => {
                const isSelected = selectedIds.has(option.id)
                const reason =
                  option.requires?.find((id) => !selectedIds.has(id)) ??
                  option.excludes?.find((id) => selectedIds.has(id))
                const name = displayName(option.id)
                return (
                  <button
                    aria-pressed={isSelected}
                    className="option-button"
                    disabled={Boolean(reason) && !isSelected}
                    key={option.id}
                    onClick={() => chooseOption(option)}
                    type="button"
                  >
                    <strong>{name}</strong>
                    <span>
                      {option.priceDeltaCents > 0
                        ? `+${formatPrice(option.priceDeltaCents, locale)}`
                        : formatPrice(0, locale)}
                    </span>
                    {reason && !isSelected && (
                      <span className="option-reason">
                        {messages.configurator.disabledReason} ({displayName(reason)})
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="account-card">
              <h3>{modelSlug}</h3>
              {configuration.selections.map((option) => (
                <p key={option.id}>
                  {displayName(option.id)} · {formatPrice(option.priceDeltaCents, locale)}
                </p>
              ))}
              <p>
                {locale === 'de-de' ? 'Konfigurationscode' : 'Configuration code'}:{' '}
                <code>{buildConfigurationCode(configuration)}</code>
              </p>
              <button
                className="button button-secondary"
                onClick={() => window.print()}
                type="button"
              >
                {locale === 'de-de' ? 'Drucken' : 'Print'}
              </button>
              <button
                className="button button-secondary"
                onClick={() => {
                  const shareUrl = new URL(window.location.href)
                  shareUrl.searchParams.set('cfg', buildConfigurationCode(configuration))
                  void navigator.clipboard.writeText(shareUrl.toString())
                }}
                type="button"
              >
                {messages.configurator.share}
              </button>
              <a
                className="button button-primary"
                href={`/${locale}/probefahrt?model=${modelSlug}&cfg=${encodeURIComponent(buildConfigurationCode(configuration))}`}
              >
                {messages.configurator.testDrive}
              </a>
              <a
                href={`/${locale}/konto?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`}
              >
                {messages.configurator.save}
              </a>
            </div>
          )}
          <div className="config-price">
            <span>{messages.configurator.price}</span>
            <strong aria-live="polite">
              {verifiedPrice !== null
                ? formatPrice(verifiedPrice, locale)
                : priceError
                  ? '—'
                  : formatPrice(price, locale)}
            </strong>
          </div>
          {priceError && (
            <p className="field-error" role="status">
              {messages.configurator.verifyFailed}
            </p>
          )}
          <div className="consent-actions">
            <button
              className="button button-secondary"
              disabled={step === 0}
              onClick={() => {
                const next = step - 1
                setStep(next)
                window.history.pushState(
                  { step: next },
                  '',
                  `?cfg=${encodeURIComponent(buildConfigurationCode(configuration))}&step=${next}`,
                )
              }}
              type="button"
            >
              {messages.configurator.back}
            </button>
            <button
              className="button button-primary"
              disabled={step === 5}
              onClick={() => {
                const next = step + 1
                setStep(next)
                window.history.pushState(
                  { step: next },
                  '',
                  `?cfg=${encodeURIComponent(buildConfigurationCode(configuration))}&step=${next}`,
                )
              }}
              type="button"
            >
              {messages.configurator.next}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

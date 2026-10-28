'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'

import type { Lead } from '@/features/leads/lead.schema'
import { leadSchema } from '@/features/leads/lead.schema'
import { submitLeadAction } from '@/features/leads/submit-lead.actions'
import { getMessages } from '@/lib/messages'

export function LeadForm({
  locale,
  leadType,
  modelSlug,
}: {
  locale: string
  leadType: 'test-drive' | 'contact'
  modelSlug: string | undefined
}) {
  const messages = getMessages(locale)
  const [step, setStep] = useState(0)
  const [complete, setComplete] = useState(false)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<Lead>({
    resolver: zodResolver(leadSchema),
    mode: 'onBlur',
    defaultValues: {
      leadType,
      modelSlug: modelSlug ?? '',
      requestedDate: '',
      dealerId: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      consent: false,
      honeypot: '',
    },
  })

  const fieldLabels = {
    firstName: messages.leads.firstName,
    lastName: messages.leads.lastName,
    email: messages.leads.email,
    phone: messages.leads.phone,
    modelSlug: messages.leads.model,
    requestedDate: messages.leads.date,
    dealerId: messages.leads.dealer,
  } as const

  const focusErrorSummary = useCallback(() => {
    window.requestAnimationFrame(() => {
      const summary = document.getElementById('error-summary-title')
      summary?.focus()
    })
  }, [])

  async function handleStep(nextStep: number) {
    const fields = step === 0 ? ['modelSlug'] : step === 1 ? ['requestedDate', 'dealerId'] : []
    const valid =
      fields.length === 0 ||
      (await trigger(fields as ('modelSlug' | 'requestedDate' | 'dealerId')[]))

    if (valid) {
      setStep(nextStep)
      return
    }

    focusErrorSummary()
  }

  async function handleValidSubmit(values: Lead) {
    const formData = new FormData()
    Object.entries(values).forEach(([key, value]) => formData.set(key, String(value)))

    if (values.consent) {
      formData.set('consent', 'on')
    }

    const result = await submitLeadAction(formData)
    if (result.success) {
      setComplete(true)
      return
    }

    setServerError(result.message)
    focusErrorSummary()
  }

  if (complete) {
    return (
      <div aria-live="polite" className="account-card" role="status">
        <h2>{messages.leads.success}</h2>
        <p>{messages.leads.success}</p>
      </div>
    )
  }

  const visibleErrors = Object.entries(errors).filter(
    ([key]) => key !== 'leadType' && key !== 'honeypot',
  )

  return (
    <form
      className="form-shell"
      noValidate
      onSubmit={handleSubmit(handleValidSubmit, focusErrorSummary)}
    >
      {leadType === 'test-drive' && (
        <ol
          aria-label={locale === 'de-de' ? 'Formularfortschritt' : 'Form progress'}
          className="step-progress"
        >
          {[0, 1, 2].map((item) => (
            <li aria-current={step === item ? 'step' : undefined} key={item}>
              {item + 1} / 3
            </li>
          ))}
        </ol>
      )}

      {(serverError || visibleErrors.length > 0) && (
        <div
          aria-describedby="error-summary-title"
          className="error-summary"
          role="alert"
          tabIndex={-1}
        >
          <h2 id="error-summary-title">{messages.leads.errors}</h2>
          {serverError && <p>{serverError}</p>}
          {visibleErrors.map(([key, error]) => (
            <a href={`#${key}`} key={key}>
              {fieldLabels[key as keyof typeof fieldLabels] ?? key}:{' '}
              {error?.message === 'Consent is required' ? messages.leads.required : error?.message}
            </a>
          ))}
        </div>
      )}

      <input type="hidden" {...register('leadType')} />

      {leadType === 'test-drive' && (
        <>
          <section hidden={step !== 0}>
            <h2>{messages.leads.model}</h2>
            <label className="field">
              {messages.leads.model}
              <select id="modelSlug" {...register('modelSlug')}>
                <option value="">{messages.models.all}</option>
                <option value="aurelia">Aurelia One</option>
                <option value="valora-x">Valora X</option>
                <option value="novara-gt">Novara GT</option>
              </select>
              {errors.modelSlug && <span className="field-error">{messages.leads.required}</span>}
            </label>
            <button
              className="button button-primary"
              onClick={() => void handleStep(1)}
              type="button"
            >
              {messages.configurator.next}
            </button>
          </section>

          <section hidden={step !== 1}>
            <h2>
              {messages.leads.date} &amp; {messages.leads.dealer}
            </h2>

            <div className="form-grid">
              <label className="field">
                {messages.leads.date}
                <input
                  id="requestedDate"
                  min={new Date().toISOString().slice(0, 10)}
                  type="date"
                  {...register('requestedDate')}
                />
              </label>
              <label className="field">
                {messages.leads.dealer}
                <select id="dealerId" {...register('dealerId')}>
                  <option value="">{messages.models.all}</option>
                  <option value="dealer-munich">BAVARIA Studio München</option>
                  <option value="dealer-hamburg">BAVARIA Studio Hamburg</option>
                </select>
              </label>
            </div>

            <div className="consent-actions">
              <button className="button button-secondary" onClick={() => setStep(0)} type="button">
                {messages.configurator.back}
              </button>
              <button
                className="button button-primary"
                onClick={() => void handleStep(2)}
                type="button"
              >
                {messages.configurator.next}
              </button>
            </div>
          </section>
        </>
      )}

      {(leadType === 'contact' || step === 2) && (
        <section>
          <h2>{messages.leads.contactTitle}</h2>
          <div className="form-grid">
            <label className="field">
              {messages.leads.firstName}
              <input autoComplete="given-name" id="firstName" {...register('firstName')} />
              {errors.firstName && <span className="field-error">{messages.leads.required}</span>}
            </label>
            <label className="field">
              {messages.leads.lastName}
              <input autoComplete="family-name" id="lastName" {...register('lastName')} />
              {errors.lastName && <span className="field-error">{messages.leads.required}</span>}
            </label>
            <label className="field">
              {messages.leads.email}
              <input autoComplete="email" id="email" type="email" {...register('email')} />
              {errors.email && <span className="field-error">{messages.leads.invalidEmail}</span>}
            </label>
            <label className="field">
              {messages.leads.phone}
              <input autoComplete="tel" id="phone" type="tel" {...register('phone')} />
            </label>
          </div>

          <label className="consent-field">
            <input type="checkbox" {...register('consent')} />
            <span>{messages.leads.consent}</span>
          </label>
          {errors.consent && <p className="field-error">{messages.leads.required}</p>}

          <label aria-hidden="true" className="visually-hidden" htmlFor="website">
            Website
          </label>
          <input
            autoComplete="off"
            className="visually-hidden"
            id="website"
            tabIndex={-1}
            {...register('honeypot')}
          />

          {leadType === 'test-drive' && (
            <button className="button button-secondary" onClick={() => setStep(1)} type="button">
              {messages.configurator.back}
            </button>
          )}

          <button className="button button-primary" disabled={isSubmitting} type="submit">
            {isSubmitting ? '…' : messages.leads.submit}
          </button>
        </section>
      )}
    </form>
  )
}

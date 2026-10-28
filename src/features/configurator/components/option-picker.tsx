'use client'

import { useId } from 'react'

import { cn } from '@/lib/cn'
import { formatPrice } from '@/lib/format-price'

export interface PickerOption {
  id: string
  label: string
  description?: string
  priceDeltaCents: number
  /** Paint colour from the product data (not a design token); rendered as a swatch. */
  swatch?: string
}

type SelectionProps =
  | { mode: 'single'; value: string | null; onChange: (id: string) => void }
  | { mode: 'multiple'; value: string[]; onChange: (ids: string[]) => void }

export type OptionPickerProps = SelectionProps & {
  options: PickerOption[]
  /** Option id → visible explanation why it cannot be chosen (BAV-UX-007 5.4). */
  disabledReasons?: Record<string, string>
  locale: string
  labels: { legend: string; included: string }
}

/**
 * Option list for one configurator step built on native radios/checkboxes inside a fieldset,
 * so arrow-key navigation and form semantics come for free. Disabled options keep their
 * reason visible and linked via aria-describedby instead of silently disappearing.
 */
export function OptionPicker(props: OptionPickerProps) {
  const { options, disabledReasons = {}, locale, labels, mode } = props
  const name = useId()

  const isChecked = (id: string) =>
    props.mode === 'single' ? props.value === id : props.value.includes(id)

  const toggle = (id: string) => {
    if (props.mode === 'single') {
      props.onChange(id)
      return
    }
    props.onChange(
      props.value.includes(id) ? props.value.filter((value) => value !== id) : [...props.value, id],
    )
  }

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-text pb-2 text-xl font-medium">{labels.legend}</legend>
      {options.map((option) => {
        const inputId = `${name}-${option.id}`
        const reason = disabledReasons[option.id]
        const descriptionId = option.description ? `${inputId}-description` : undefined
        const reasonId = reason ? `${inputId}-reason` : undefined
        const describedBy = [descriptionId, reasonId].filter(Boolean).join(' ') || undefined
        const price =
          option.priceDeltaCents === 0
            ? labels.included
            : `+ ${formatPrice(option.priceDeltaCents, locale)}`

        return (
          <div
            key={option.id}
            className={cn(
              'relative flex items-center gap-4 rounded-sm border p-4',
              'has-checked:border-text has-focus-visible:focus-ring has-checked:border-2',
              'has-disabled:bg-surface has-disabled:border-dashed',
              'border-border-strong',
            )}
          >
            <input
              id={inputId}
              type={mode === 'single' ? 'radio' : 'checkbox'}
              name={name}
              value={option.id}
              checked={isChecked(option.id)}
              disabled={reason !== undefined}
              aria-describedby={describedBy}
              onChange={() => toggle(option.id)}
              className="accent-brand-primary size-6 shrink-0 cursor-pointer disabled:cursor-not-allowed"
            />
            {option.swatch ? (
              <span
                aria-hidden="true"
                className="rounded-pill border-border-strong size-8 shrink-0 border"
                style={{ backgroundColor: option.swatch }}
              />
            ) : null}
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <label
                htmlFor={inputId}
                className="text-text cursor-pointer font-medium after:absolute after:inset-0 after:content-['']"
              >
                {option.label}
              </label>
              {option.description ? (
                <span id={descriptionId} className="text-text-muted text-sm">
                  {option.description}
                </span>
              ) : null}
              {reason ? (
                <span id={reasonId} className="text-text text-sm">
                  {reason}
                </span>
              ) : null}
            </div>
            <span className="text-text shrink-0 text-sm font-medium tabular-nums">{price}</span>
          </div>
        )
      })}
    </fieldset>
  )
}

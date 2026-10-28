'use client'

import { useId } from 'react'

import { cn } from '@/lib/cn'

import { controlClasses, describedBy } from './control-styles'
import { FieldMessage } from './field-message'
import { Icon } from './icon'

import type { ComponentPropsWithRef } from 'react'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps extends Omit<ComponentPropsWithRef<'select'>, 'id' | 'children'> {
  label: string
  options: SelectOption[]
  hint?: string
  error?: string
  /** Optional first, empty option such as "Bitte wählen". */
  placeholder?: string
  id?: string
}

/** Native select: best a11y and mobile UX; only the chrome is styled. */
export function Select({
  label,
  options,
  hint,
  error,
  placeholder,
  id,
  required,
  className,
  ...props
}: SelectProps) {
  const generatedId = useId()
  const selectId = id ?? generatedId
  const hintId = `${selectId}-hint`
  const errorId = `${selectId}-error`

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={selectId} className="text-sm font-medium text-text">
        {label}
        {required ? (
          <span aria-hidden="true" className="ms-1 text-danger">
            *
          </span>
        ) : null}
      </label>
      <div className="relative">
        <select
          id={selectId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(hint && hintId, error && errorId)}
          className={cn(controlClasses, 'appearance-none pe-12')}
          {...props}
        >
          {placeholder ? <option value="">{placeholder}</option> : null}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        <Icon
          name="chevron-down"
          size="sm"
          className="pointer-events-none absolute inset-y-0 end-4 my-auto text-text-muted"
        />
      </div>
      {hint ? <FieldMessage id={hintId} tone="hint">{hint}</FieldMessage> : null}
      {error ? <FieldMessage id={errorId} tone="error">{error}</FieldMessage> : null}
    </div>
  )
}

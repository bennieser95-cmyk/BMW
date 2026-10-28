'use client'

import { useId } from 'react'

import { cn } from '@/lib/cn'

import { controlClasses, describedBy } from './control-styles'
import { FieldMessage } from './field-message'

import type { ComponentPropsWithRef } from 'react'

export interface InputProps extends Omit<ComponentPropsWithRef<'input'>, 'id'> {
  label: string
  hint?: string
  /** Error message; sets aria-invalid and is linked via aria-describedby. */
  error?: string
  id?: string
}

/**
 * Labelled text input. Forwards ref (React 19 ref prop) so it works with
 * react-hook-form's register().
 */
export function Input({ label, hint, error, id, required, className, ...props }: InputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const hintId = `${inputId}-hint`
  const errorId = `${inputId}-error`

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={inputId} className="text-sm font-medium text-text">
        {label}
        {required ? (
          <span aria-hidden="true" className="ms-1 text-danger">
            *
          </span>
        ) : null}
      </label>
      <input
        id={inputId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(hint && hintId, error && errorId)}
        className={controlClasses}
        {...props}
      />
      {hint ? <FieldMessage id={hintId} tone="hint">{hint}</FieldMessage> : null}
      {error ? <FieldMessage id={errorId} tone="error">{error}</FieldMessage> : null}
    </div>
  )
}

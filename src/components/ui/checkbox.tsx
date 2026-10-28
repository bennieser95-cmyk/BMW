'use client'

import { useId } from 'react'

import { cn } from '@/lib/cn'

import { describedBy } from './control-styles'
import { FieldMessage } from './field-message'

import type { ComponentPropsWithRef, ReactNode } from 'react'

export interface CheckboxProps extends Omit<ComponentPropsWithRef<'input'>, 'id' | 'type'> {
  /** ReactNode so consent texts can contain links. */
  label: ReactNode
  hint?: string
  error?: string
  id?: string
}

/** Native checkbox with a 44 px tap area around the visible 24 px box. */
export function Checkbox({ label, hint, error, id, required, className, ...props }: CheckboxProps) {
  const generatedId = useId()
  const checkboxId = id ?? generatedId
  const hintId = `${checkboxId}-hint`
  const errorId = `${checkboxId}-error`

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div className="flex items-start gap-3">
        <span className="flex size-touch shrink-0 items-center justify-center">
          <input
            id={checkboxId}
            type="checkbox"
            required={required}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy(hint && hintId, error && errorId)}
            className="size-6 cursor-pointer accent-brand-primary disabled:cursor-not-allowed"
            {...props}
          />
        </span>
        <label htmlFor={checkboxId} className="cursor-pointer py-3 text-base text-text">
          {label}
          {required ? (
            <span aria-hidden="true" className="ms-1 text-danger">
              *
            </span>
          ) : null}
        </label>
      </div>
      {hint ? <FieldMessage id={hintId} tone="hint">{hint}</FieldMessage> : null}
      {error ? <FieldMessage id={errorId} tone="error">{error}</FieldMessage> : null}
    </div>
  )
}

'use client'

import { Slot } from '@radix-ui/react-slot'
import { useId } from 'react'

import { describedBy } from '@/components/ui/control-styles'
import { FieldMessage } from '@/components/ui/field-message'
import { cn } from '@/lib/cn'

import type { ReactElement } from 'react'

export interface FormFieldProps {
  label: string
  /** Any single form control; id, aria-describedby, aria-invalid and required are injected. */
  control: ReactElement
  description?: string
  error?: string
  required?: boolean
  id?: string
  className?: string
}

/**
 * Wraps arbitrary controls (e.g. RHF Controller fields, date pickers) with label, description
 * and error wiring so custom controls get the same a11y contract as the Input atom.
 */
export function FormField({
  label,
  control,
  description,
  error,
  required = false,
  id,
  className,
}: FormFieldProps) {
  const generatedId = useId()
  const controlId = id ?? generatedId
  const descriptionId = `${controlId}-description`
  const errorId = `${controlId}-error`

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={controlId} className="text-text text-sm font-medium">
        {label}
        {required ? (
          <span aria-hidden="true" className="text-danger ms-1">
            *
          </span>
        ) : null}
      </label>
      <Slot
        id={controlId}
        aria-describedby={describedBy(description && descriptionId, error && errorId)}
        aria-invalid={error ? true : undefined}
        aria-required={required || undefined}
      >
        {control}
      </Slot>
      {description ? (
        <FieldMessage id={descriptionId} tone="hint">
          {description}
        </FieldMessage>
      ) : null}
      {error ? (
        <FieldMessage id={errorId} tone="error">
          {error}
        </FieldMessage>
      ) : null}
    </div>
  )
}

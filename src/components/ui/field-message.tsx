import { cn } from '@/lib/cn'

import { Icon } from './icon'

import type { ReactNode } from 'react'

export interface FieldMessageProps {
  id: string
  tone: 'hint' | 'error'
  children: ReactNode
}

/**
 * Hint or error text below a form control. Errors pair an icon with text so the state is not
 * conveyed by colour alone (WCAG 1.4.1).
 */
export function FieldMessage({ id, tone, children }: FieldMessageProps) {
  const isError = tone === 'error'

  return (
    <p
      id={id}
      className={cn(
        'flex items-start gap-1 text-sm',
        isError ? 'text-danger font-medium' : 'text-text-muted',
      )}
    >
      {isError ? <Icon name="alert-circle" size="sm" className="mt-px" /> : null}
      <span>{children}</span>
    </p>
  )
}

import { cva } from 'class-variance-authority'

import { cn } from '@/lib/cn'

import type { VariantProps } from 'class-variance-authority'
import type { ComponentPropsWithRef } from 'react'

export const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-sm border px-2 py-1 text-xs font-medium tracking-wide uppercase',
  {
    variants: {
      // Text colours are the contrast-checked foreground tokens (see docs/design-system/contrast.md).
      tone: {
        neutral: 'border-border-strong bg-surface text-text',
        brand: 'border-transparent bg-brand-primary text-on-brand',
        success: 'border-success bg-surface text-success',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
)

export interface BadgeProps extends ComponentPropsWithRef<'span'>, VariantProps<typeof badgeVariants> {}

/** Small status label such as "Neu" or "Elektrisch". */
export function Badge({ tone, className, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />
}

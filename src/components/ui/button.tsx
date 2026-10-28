import { Slot, Slottable } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { LoaderCircle } from 'lucide-react'

import { cn } from '@/lib/cn'

import type { VariantProps } from 'class-variance-authority'
import type { ComponentPropsWithRef } from 'react'

export const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 rounded-sm border font-medium whitespace-nowrap',
    'select-none focus-visible:focus-ring',
    'disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50',
    // Only transform is animated (BAV-DG-004 8); colours switch instantly.
    'transition-transform duration-(--motion-base) ease-standard active:scale-[0.98]',
  ],
  {
    variants: {
      variant: {
        primary: 'border-transparent bg-brand-primary text-on-brand hover:bg-brand-primary-hover',
        secondary: 'border-text bg-transparent text-text hover:bg-surface',
        ghost:
          'border-transparent bg-transparent text-brand-primary underline-offset-4 hover:underline',
      },
      size: {
        // Every size keeps the >= 44 px touch target (WCAG 2.5.8 / BAV-UX-007).
        sm: 'min-h-touch px-3 text-sm',
        md: 'min-h-12 px-6 text-base',
        lg: 'min-h-16 px-8 text-lg',
        icon: 'size-touch p-0',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

export interface ButtonProps
  extends ComponentPropsWithRef<'button'>, VariantProps<typeof buttonVariants> {
  /** Shows a spinner, sets aria-busy and blocks interaction. */
  loading?: boolean
  /** Screen-reader text announced while loading, e.g. "Wird gesendet". */
  loadingLabel?: string
  /** Renders the single child (e.g. a link) with button styling instead of a <button>. */
  asChild?: boolean
}

/** Primary interaction element with primary/secondary/ghost variants. */
export function Button({
  variant,
  size,
  loading = false,
  loadingLabel,
  asChild = false,
  className,
  children,
  disabled,
  type,
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot : 'button'
  const isDisabled = disabled === true || loading

  return (
    <Component
      className={cn(buttonVariants({ variant, size }), className)}
      aria-busy={loading || undefined}
      {...(asChild
        ? { 'aria-disabled': isDisabled || undefined }
        : { disabled: isDisabled, type: type ?? 'button' })}
      {...props}
    >
      {loading ? (
        <LoaderCircle aria-hidden="true" className="size-4 shrink-0 motion-safe:animate-spin" />
      ) : null}
      <Slottable>{children}</Slottable>
      {loading && loadingLabel ? (
        <span className="sr-only" role="status">
          {loadingLabel}
        </span>
      ) : null}
    </Component>
  )
}

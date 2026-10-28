import { cn } from '@/lib/cn'

/**
 * Shared control styling for Input and Select: border-strong keeps the 3:1 non-text contrast
 * (WCAG 1.4.11), invalid state adds a thicker danger border in addition to the error text.
 */
export const controlClasses = cn(
  'block w-full min-h-12 rounded-sm border border-border-strong bg-bg px-3 text-base text-text',
  'placeholder:text-text-muted',
  'disabled:cursor-not-allowed disabled:bg-surface disabled:text-text-muted',
  'aria-invalid:border-2 aria-invalid:border-danger',
)

/** Builds the aria-describedby list from the optional hint and error ids. */
export function describedBy(...ids: Array<string | false | undefined>): string | undefined {
  const value = ids.filter(Boolean).join(' ')
  return value === '' ? undefined : value
}

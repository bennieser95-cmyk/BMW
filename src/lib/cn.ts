import { clsx } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

import type { ClassValue } from 'clsx'

// The token scale replaces Tailwind's defaults, so tailwind-merge must learn the custom keys;
// otherwise e.g. `text-sm` and `text-text-muted` would be treated as conflicting classes.
const mergeClasses = extendTailwindMerge({
  extend: {
    theme: {
      color: [
        'bg',
        'surface',
        'text',
        'text-muted',
        'brand-primary',
        'brand-primary-hover',
        'brand-accent',
        'border',
        'border-strong',
        'focus',
        'success',
        'warning',
        'danger',
        'on-brand',
        'on-media',
        'overlay',
      ],
      text: ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'],
      spacing: ['touch', 'header', 'header-sm'],
      radius: ['sm', 'md', 'lg', 'pill'],
      shadow: ['1', '2', '3'],
      ease: ['standard'],
      breakpoint: ['sm', 'md', 'lg', 'xl', '2xl'],
      'font-weight': ['light', 'regular', 'medium', 'bold'],
      leading: ['tight', 'normal', 'relaxed'],
    },
  },
})

/** Joins conditional class names and resolves Tailwind conflicts (last class wins). */
export function cn(...inputs: ClassValue[]): string {
  return mergeClasses(clsx(inputs))
}

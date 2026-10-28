import { cva } from 'class-variance-authority'
import NextLink from 'next/link'

import { cn } from '@/lib/cn'

import { Icon } from './icon'

import type { VariantProps } from 'class-variance-authority'
import type { ComponentProps, ComponentPropsWithRef } from 'react'

type NextAnchorProps = Omit<ComponentProps<typeof NextLink>, 'href'>

export const linkVariants = cva(
  'inline-flex items-center gap-1 text-brand-primary underline-offset-4 hover:text-brand-primary-hover',
  {
    variants: {
      underline: {
        always: 'underline',
        hover: 'no-underline hover:underline',
        none: 'no-underline',
      },
    },
    defaultVariants: { underline: 'hover' },
  },
)

export interface LinkProps
  extends Omit<ComponentPropsWithRef<'a'>, 'href'>, VariantProps<typeof linkVariants> {
  href: string
  /** Opens in a new tab with a safe rel and announces that to screen readers. */
  external?: boolean
  /** Screen-reader hint appended to external links, e.g. "öffnet in neuem Tab". */
  externalLabel?: string
}

/** Text link: next/link for internal routes, a plain anchor for external targets. */
export function Link({
  href,
  external = false,
  externalLabel,
  underline,
  className,
  children,
  ...props
}: LinkProps) {
  const classes = cn(linkVariants({ underline }), className)

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes} {...props}>
        {children}
        <Icon name="external-link" size="sm" />
        {externalLabel ? <span className="sr-only">({externalLabel})</span> : null}
      </a>
    )
  }

  return (
    // Same anchor attributes; the cast only bridges next/link's stricter optional handler types.
    <NextLink href={href} className={classes} {...(props as NextAnchorProps)}>
      {children}
    </NextLink>
  )
}

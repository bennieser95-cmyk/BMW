'use client'

import NextLink from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/cn'
import { routing } from '@/lib/i18n/routing'

export interface LocaleSwitchProps {
  locale: string
  /** Accessible name, e.g. "Sprache". */
  label: string
  className?: string
}

/** Links to the current page in the next locale; the visible text is the target locale code. */
export function LocaleSwitch({ locale, label, className }: LocaleSwitchProps) {
  const pathname = usePathname()
  const locales: readonly string[] = routing.locales
  const target = locales[(locales.indexOf(locale) + 1) % locales.length] ?? locale
  const href = pathname.replace(new RegExp(`^/${locale}(?=/|$)`), `/${target}`)

  return (
    <NextLink
      href={href === pathname ? `/${target}` : href}
      aria-label={label}
      hrefLang={target}
      className={cn(
        'inline-flex min-h-touch min-w-touch items-center justify-center text-sm font-medium uppercase hover:underline',
        className,
      )}
    >
      {target.slice(0, 2)}
    </NextLink>
  )
}

import NextLink from 'next/link'

import { Logo } from '@/components/ui/logo'

import type { NavGroup, NavLink } from './navigation.types'
import type { ReactNode } from 'react'

export interface SiteFooterProps {
  linkGroups: NavGroup[]
  legalLinks: NavLink[]
  locale: string
  labels: { footerNav: string; legalNav: string; homeLink: string; copyright: string }
  /** Additional controls such as theme toggle or locale switch. */
  utilitySlot?: ReactNode
}

const linkClasses = 'inline-flex min-h-touch items-center text-sm text-text-muted hover:text-text hover:underline'

/** Global footer with grouped sitemap links and legal links. */
export function SiteFooter({ linkGroups, legalLinks, locale, labels, utilitySlot }: SiteFooterProps) {
  return (
    <footer className="mt-24 border-t border-border bg-surface text-text">
      <div className="layout-container flex flex-col gap-12 py-16">
        <NextLink href={`/${locale}`} className="inline-flex min-h-touch w-fit items-center">
          <Logo label={labels.homeLink} />
        </NextLink>
        <nav aria-label={labels.footerNav}>
          <ul className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {linkGroups.map((group, index) => (
              <li key={group.title ?? index} className="flex flex-col gap-2">
                {group.title ? <h2 className="text-base font-medium">{group.title}</h2> : null}
                <ul className="flex flex-col">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <NextLink href={link.href} className={linkClasses}>
                        {link.label}
                      </NextLink>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex flex-col gap-4 border-t border-border pt-8 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-text-muted">{labels.copyright}</p>
          <nav aria-label={labels.legalNav}>
            <ul className="flex flex-wrap gap-x-6">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <NextLink href={link.href} className={linkClasses}>
                    {link.label}
                  </NextLink>
                </li>
              ))}
            </ul>
          </nav>
          {utilitySlot ? <div className="flex items-center gap-4">{utilitySlot}</div> : null}
        </div>
      </div>
    </footer>
  )
}

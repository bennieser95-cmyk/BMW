'use client'

import NextLink from 'next/link'
import { useState } from 'react'

import { useScrollHeader } from '@/components/hooks/use-scroll-header'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Logo } from '@/components/ui/logo'
import { cn } from '@/lib/cn'

import { LocaleSwitch } from './locale-switch'
import { MegaMenu } from './mega-menu'
import { MobileNavDrawer } from './mobile-nav-drawer'

import type { NavItem, SiteHeaderLabels } from './navigation.types'
import type { ReactNode } from 'react'

export interface SiteHeaderProps {
  navItems: NavItem[]
  locale: string
  labels: SiteHeaderLabels
  /** Opens a search overlay; without it the search icon links to /{locale}/suche. */
  onSearch?: () => void
  /** Client-only account entry (session state), e.g. <AccountStatus />. */
  accountSlot?: ReactNode
  /** Starts transparent over a full-bleed hero until the page is scrolled 80 px. */
  overlay?: boolean
}

/**
 * Global header: 56 px mobile / 72 px desktop, fixed, hides on scroll-down (FR-NAV-004) and
 * reappears on scroll-up. Never reads the session itself, so pages using it can stay static.
 */
export function SiteHeader({
  navItems,
  locale,
  labels,
  onSearch,
  accountSlot,
  overlay = false,
}: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [focusInside, setFocusInside] = useState(false)
  const { isSolid, isHidden } = useScrollHeader(menuOpen || focusInside)
  const isTransparent = overlay && !isSolid && !menuOpen
  const iconClasses = isTransparent ? 'text-on-media' : 'text-text'

  return (
    <>
      {/* Reserves the header height for normal pages so content does not slide underneath. */}
      {overlay ? null : <div aria-hidden="true" className="h-header-sm lg:h-header" />}
      <header
        onFocus={() => setFocusInside(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setFocusInside(false)
        }}
        className={cn(
          'h-header-sm lg:h-header fixed inset-x-0 top-0 z-(--z-header)',
          'ease-standard transition-transform duration-(--motion-base)',
          isHidden ? '-translate-y-full' : 'translate-y-0',
          isTransparent ? 'text-on-media' : 'border-border bg-bg text-text border-b',
        )}
      >
        {isTransparent ? <div aria-hidden="true" className="header-scrim" /> : null}
        <div className="layout-container flex h-full items-center gap-4">
          <NextLink href={`/${locale}`} className="min-h-touch inline-flex items-center">
            <Logo label={labels.homeLink} className="h-6 lg:h-8" />
          </NextLink>
          <div className="hidden h-full flex-1 justify-center lg:flex">
            <MegaMenu
              items={navItems}
              label={labels.mainNav}
              onOpenChange={setMenuOpen}
              onMedia={isTransparent}
            />
          </div>
          <div className="ms-auto flex items-center gap-1 lg:ms-0">
            {onSearch ? (
              <Button
                variant="ghost"
                size="icon"
                aria-label={labels.search}
                onClick={onSearch}
                className={iconClasses}
              >
                <Icon name="search" />
              </Button>
            ) : (
              <Button asChild variant="ghost" size="icon" className={iconClasses}>
                <NextLink href={`/${locale}/suche`} aria-label={labels.search}>
                  <Icon name="search" />
                </NextLink>
              </Button>
            )}
            <LocaleSwitch
              locale={locale}
              label={labels.language}
              className="hidden lg:inline-flex"
            />
            {accountSlot ? <div className="hidden lg:block">{accountSlot}</div> : null}
            <div className="lg:hidden">
              <MobileNavDrawer
                items={navItems}
                labels={labels}
                onMedia={isTransparent}
                onOpenChange={setMenuOpen}
                footerSlot={
                  <>
                    <LocaleSwitch locale={locale} label={labels.language} />
                    {accountSlot}
                  </>
                }
              />
            </div>
          </div>
        </div>
      </header>
    </>
  )
}

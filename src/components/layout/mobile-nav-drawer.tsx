'use client'

import * as Accordion from '@radix-ui/react-accordion'
import * as Dialog from '@radix-ui/react-dialog'
import NextLink from 'next/link'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/cn'

import type { NavItem } from './navigation.types'
import type { ReactNode } from 'react'

export interface MobileNavDrawerProps {
  items: NavItem[]
  labels: { mobileNav: string; openMenu: string; closeMenu: string }
  /** Extra actions in the drawer footer (locale switch, account). */
  footerSlot?: ReactNode
  /** Light trigger icon over a transparent header on media. */
  onMedia?: boolean
  onOpenChange?: (open: boolean) => void
}

const rowClasses =
  'flex min-h-touch w-full items-center justify-between py-3 text-xl font-light text-text'

/**
 * Full-screen mobile navigation. Radix Dialog provides focus trap, Esc handling, focus return
 * and background scroll lock; accordions keep the second level compact.
 */
export function MobileNavDrawer({
  items,
  labels,
  footerSlot,
  onMedia = false,
  onOpenChange,
}: MobileNavDrawerProps) {
  const [open, setOpen] = useState(false)
  const changeOpen = (next: boolean) => {
    setOpen(next)
    onOpenChange?.(next)
  }

  return (
    <Dialog.Root open={open} onOpenChange={changeOpen}>
      <Dialog.Trigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={labels.openMenu}
          className={onMedia ? 'text-on-media' : 'text-text'}
        >
          <Icon name="menu" />
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-0 z-(--z-modal) flex flex-col overflow-y-auto bg-bg motion-safe:animate-slide-in-end"
        >
          <div className="layout-container flex h-header-sm items-center justify-between border-b border-border">
            <Dialog.Title className="text-sm font-medium text-text-muted">{labels.mobileNav}</Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" aria-label={labels.closeMenu} className="text-text">
                <Icon name="close" />
              </Button>
            </Dialog.Close>
          </div>
          <nav aria-label={labels.mobileNav} className="layout-container flex-1 py-4">
            <Accordion.Root type="multiple" asChild>
              <ul className="flex flex-col divide-y divide-border">
                {items.map((item) =>
                  item.groups ? (
                    <Accordion.Item key={item.id} value={item.id} asChild>
                      <li>
                        <Accordion.Header asChild>
                          <h2 className="text-xl">
                            <Accordion.Trigger className={cn(rowClasses, 'group')}>
                              {item.label}
                              <Icon
                                name="chevron-down"
                                className="transition-transform duration-(--motion-fast) ease-standard group-data-[state=open]:rotate-180"
                              />
                            </Accordion.Trigger>
                          </h2>
                        </Accordion.Header>
                        <Accordion.Content className="pb-4">
                          {item.groups.map((group, index) => (
                            <ul key={group.title ?? index} className="flex flex-col">
                              {group.links.map((link) => (
                                <li key={link.href}>
                                  <NextLink
                                    href={link.href}
                                    onClick={() => changeOpen(false)}
                                    className="flex min-h-touch items-center ps-4 text-base text-text hover:underline"
                                  >
                                    {link.label}
                                  </NextLink>
                                </li>
                              ))}
                            </ul>
                          ))}
                        </Accordion.Content>
                      </li>
                    </Accordion.Item>
                  ) : (
                    <li key={item.id}>
                      <NextLink
                        href={item.href ?? '#'}
                        onClick={() => changeOpen(false)}
                        className={rowClasses}
                      >
                        {item.label}
                      </NextLink>
                    </li>
                  ),
                )}
              </ul>
            </Accordion.Root>
          </nav>
          {footerSlot ? (
            <div className="layout-container flex items-center gap-4 border-t border-border py-4">
              {footerSlot}
            </div>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

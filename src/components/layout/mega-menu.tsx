'use client'

import NextLink from 'next/link'
import { useCallback, useEffect, useId, useRef, useState } from 'react'

import { useHoverIntent } from '@/components/hooks/use-hover-intent'
import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/cn'

import type { NavItem } from './navigation.types'
import type { KeyboardEvent } from 'react'

export interface MegaMenuProps {
  items: NavItem[]
  label: string
  /** Notifies the header so it stays visible and solid while a panel is open. */
  onOpenChange?: (open: boolean) => void
  /** Light text over a transparent header on media. */
  onMedia?: boolean
}

const triggerClasses =
  'inline-flex min-h-touch items-center gap-1 px-3 text-sm font-medium underline-offset-8 hover:underline'

/**
 * Desktop navigation (disclosure pattern, not ARIA menu): hover opens after 150 ms intent,
 * click/Enter opens and moves focus into the panel, Esc closes and returns focus to the trigger.
 */
export function MegaMenu({ items, label, onOpenChange, onMedia = false }: MegaMenuProps) {
  const [openId, setOpenId] = useState<string | null>(null)
  const { schedule, cancel } = useHoverIntent()
  const baseId = useId()
  const navRef = useRef<HTMLElement>(null)
  const triggerRefs = useRef(new Map<string, HTMLButtonElement>())
  const panelRefs = useRef(new Map<string, HTMLDivElement>())
  const focusPanelOnOpen = useRef(false)

  const setOpen = useCallback(
    (id: string | null, focusPanel = false) => {
      focusPanelOnOpen.current = focusPanel
      setOpenId(id)
      onOpenChange?.(id !== null)
    },
    [onOpenChange],
  )

  useEffect(() => {
    if (openId === null || !focusPanelOnOpen.current) return
    panelRefs.current.get(openId)?.querySelector<HTMLElement>('a, button')?.focus()
  }, [openId])

  useEffect(() => {
    if (openId === null) return
    const onPointerDown = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) setOpen(null)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [openId, setOpen])

  const closeAndRestoreFocus = (id: string) => {
    setOpen(null)
    triggerRefs.current.get(id)?.focus()
  }

  const onKeyDown = (event: KeyboardEvent, id: string) => {
    if (event.key === 'Escape') {
      event.stopPropagation()
      closeAndRestoreFocus(id)
    }
  }

  return (
    <nav
      ref={navRef}
      aria-label={label}
      className={cn('h-full', onMedia ? 'text-on-media' : 'text-text')}
      onPointerLeave={() => {
        cancel()
        if (openId !== null && !focusPanelOnOpen.current) schedule(() => setOpen(null))
      }}
    >
      <ul className="flex h-full items-center gap-1">
        {items.map((item) => {
          const panelId = `${baseId}-${item.id}`
          const isOpen = openId === item.id

          if (!item.groups) {
            return (
              <li key={item.id}>
                <NextLink href={item.href ?? '#'} className={triggerClasses}>
                  {item.label}
                </NextLink>
              </li>
            )
          }

          return (
            <li
              key={item.id}
              className="flex h-full items-center"
              onKeyDown={(event) => onKeyDown(event, item.id)}
              onBlur={(event) => {
                // Tabbing out of trigger + panel closes it; pointer clicks are handled separately.
                const next = event.relatedTarget
                if (isOpen && next !== null && !event.currentTarget.contains(next)) setOpen(null)
              }}
            >
              <button
                ref={(node) => {
                  if (node) triggerRefs.current.set(item.id, node)
                }}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                className={triggerClasses}
                onPointerEnter={(event) => {
                  if (event.pointerType === 'mouse') schedule(() => setOpen(item.id))
                }}
                onPointerLeave={cancel}
                onClick={() => {
                  cancel()
                  // A click on a hover-opened panel pins it instead of closing it again.
                  if (isOpen && !focusPanelOnOpen.current) {
                    focusPanelOnOpen.current = true
                    return
                  }
                  // Keyboard/click opening moves focus into the panel (BAV-UX-007 5.1).
                  setOpen(isOpen ? null : item.id, !isOpen)
                }}
              >
                {item.label}
                <Icon
                  name="chevron-down"
                  size="sm"
                  className={cn(
                    'ease-standard transition-transform duration-(--motion-fast)',
                    isOpen && 'rotate-180',
                  )}
                />
              </button>
              <div
                id={panelId}
                ref={(node) => {
                  if (node) panelRefs.current.set(item.id, node)
                }}
                hidden={!isOpen}
                onPointerEnter={cancel}
                className="border-border bg-bg text-text shadow-2 motion-safe:animate-fade-in absolute inset-x-0 top-full border-t"
              >
                <div className="layout-container grid grid-cols-4 gap-8 py-12">
                  {item.groups.map((group, index) => (
                    <div key={group.title ?? index} className="flex flex-col gap-3">
                      {group.title ? (
                        <p className="text-text-muted text-xs font-medium tracking-wide uppercase">
                          {group.title}
                        </p>
                      ) : null}
                      <ul className="flex flex-col gap-1">
                        {group.links.map((link) => (
                          <li key={link.href}>
                            <NextLink
                              href={link.href}
                              onClick={() => setOpen(null)}
                              className="min-h-touch inline-flex items-center text-lg hover:underline"
                            >
                              {link.label}
                            </NextLink>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

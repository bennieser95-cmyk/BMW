'use client'

import { useEffect, useSyncExternalStore } from 'react'

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'

export interface ThemeToggleProps {
  /** Accessible name, e.g. "Dunkelmodus". */
  label: string
}

const STORAGE_KEY = 'bav-theme'
const CHANGE_EVENT = 'bav-theme-change'
const DARK_QUERY = '(prefers-color-scheme: dark)'

function subscribe(onChange: () => void): () => void {
  const media = window.matchMedia(DARK_QUERY)
  media.addEventListener('change', onChange)
  window.addEventListener(CHANGE_EVENT, onChange)
  return () => {
    media.removeEventListener('change', onChange)
    window.removeEventListener(CHANGE_EVENT, onChange)
  }
}

function isDarkSnapshot(): boolean {
  const explicit = document.documentElement.dataset.theme
  return explicit ? explicit === 'dark' : window.matchMedia(DARK_QUERY).matches
}

function applyTheme(theme: string): void {
  document.documentElement.dataset.theme = theme
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

/**
 * Switches data-theme on <html>. Without an explicit choice the OS preference applies
 * (tokens.css handles both), so only an override is stored. localStorage holds a pure UI
 * preference without tracking, so it needs no consent.
 */
export function ThemeToggle({ label }: ThemeToggleProps) {
  const dark = useSyncExternalStore(subscribe, isDarkSnapshot, () => false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'dark' || stored === 'light') applyTheme(stored)
  }, [])

  const toggle = () => {
    const theme = dark ? 'light' : 'dark'
    localStorage.setItem(STORAGE_KEY, theme)
    applyTheme(theme)
  }

  return (
    <Button variant="ghost" size="icon" aria-label={label} aria-pressed={dark} onClick={toggle} className="text-text">
      <Icon name={dark ? 'sun' : 'moon'} />
    </Button>
  )
}

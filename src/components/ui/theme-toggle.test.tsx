import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { afterEach, describe, expect, it } from 'vitest'

import { ThemeToggle } from './theme-toggle'

describe('ThemeToggle', () => {
  afterEach(() => {
    localStorage.clear()
    delete document.documentElement.dataset.theme
  })

  it('should switch to dark and persist the choice when pressed', async () => {
    const { container } = render(<ThemeToggle label="Dunkelmodus" />)
    const button = screen.getByRole('button', { name: 'Dunkelmodus' })
    expect(button).toHaveAttribute('aria-pressed', 'false')
    await userEvent.click(button)
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(localStorage.getItem('bav-theme')).toBe('dark')
    expect(button).toHaveAttribute('aria-pressed', 'true')
    expect(await axe(container)).toHaveNoViolations()
  })

  it('should apply a stored theme when mounted', () => {
    localStorage.setItem('bav-theme', 'dark')
    render(<ThemeToggle label="Dunkelmodus" />)
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
  })
})

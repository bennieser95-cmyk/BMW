import { Inter } from 'next/font/google'

/**
 * Inter variable font, self-hosted by next/font at build time (no request to Google at runtime).
 * Exposed as `--font-inter`, which `--font-sans` in tokens.css references.
 */
export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

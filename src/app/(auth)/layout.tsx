import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import '@/styles/globals.css'

export const metadata: Metadata = {
  title: { default: 'Konto | Bavaria Motors', template: '%s | Bavaria Motors' },
  robots: { index: false, follow: false },
}

export default function AuthLayout({ children }: Readonly<{ children: ReactNode }>): ReactNode {
  return (
    <html lang="de-DE">
      <body>{children}</body>
    </html>
  )
}

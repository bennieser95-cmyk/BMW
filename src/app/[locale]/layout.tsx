import { notFound } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'


import { AppProviders } from '@/components/app-providers'
import { ConsentBanner } from '@/components/consent-banner'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { env } from '@/lib/env'
import { routing } from '@/lib/i18n/routing'
import { isSupportedLocale } from '@/lib/messages'
import { inter } from '@/styles/fonts'

import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import '@/styles/globals.css'

interface LocaleLayoutProps {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export function generateStaticParams(): Array<{ locale: string }> {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: Pick<LocaleLayoutProps, 'params'>): Promise<Metadata> {
  const { locale } = await params
  if (!isSupportedLocale(locale)) notFound()

  return {
    metadataBase: new URL(env.APP_BASE_URL),
    title: { default: 'Bavaria Motors', template: '%s | Bavaria Motors' },
    description:
      locale === 'de-de'
        ? 'Der digitale Showroom von Bavaria Motors.'
        : 'The digital showroom by Bavaria Motors.',
    alternates: {
      languages: {
        'de-DE': new URL('/de-de', env.APP_BASE_URL).toString(),
        'en-GB': new URL('/en-gb', env.APP_BASE_URL).toString(),
        'x-default': new URL(`/${routing.defaultLocale}`, env.APP_BASE_URL).toString(),
      },
    },
  }
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params
  if (!isSupportedLocale(locale)) notFound()

  setRequestLocale(locale)
  const messages = await getMessages()

  return (
    <html lang={locale === 'de-de' ? 'de-DE' : 'en-GB'} className={inter.variable}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <AppProviders>
            <a
              className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-(--z-toast) focus:bg-bg focus:p-4"
              href="#main-content"
            >
              {messages.navigation.skip}
            </a>
            <SiteHeader locale={locale} />
            <main id="main-content">{children}</main>
            <SiteFooter locale={locale} />
            <ConsentBanner locale={locale} />
          </AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

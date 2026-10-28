import { notFound } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'

import { AppProviders } from '@/components/app-providers'
import { AccountStatus } from '@/components/layout/account-status'
import { ConsentManager } from '@/components/layout/consent-manager'
import { ConsentSettingsButton } from '@/components/layout/consent-settings-button'
import type { NavGroup, NavItem } from '@/components/layout/navigation.types'
import { PageShell } from '@/components/layout/page-shell'
import { SiteFooter } from '@/components/layout/site-footer'
import { SiteHeader } from '@/components/layout/site-header'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { env } from '@/lib/env'
import { formatLabel } from '@/lib/format-label'
import { routing } from '@/lib/i18n/routing'
import { getMessages as getCatalog, isSupportedLocale } from '@/lib/messages'
import { inter } from '@/styles/fonts'

import '@/styles/globals.css'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'

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
  const t = getCatalog(locale)
  const href = (path: string) => `/${locale}${path}`
  const navItems: NavItem[] = [
    {
      id: 'models',
      label: t.navigation.models,
      groups: [
        {
          links: [
            { label: t.models.title, href: href('/modelle') },
            { label: t.navigation.electric, href: href('/modelle?antrieb=elektro') },
            { label: t.home.electric, href: href('/elektro') },
          ],
        },
      ],
    },
    { id: 'dealers', label: t.navigation.dealers, href: href('/haendler') },
    { id: 'test-drive', label: t.navigation.testDrive, href: href('/probefahrt') },
  ]
  const footerGroups: NavGroup[] = [
    {
      title: t.navigation.models,
      links: [
        { label: t.models.title, href: href('/modelle') },
        { label: t.navigation.electric, href: href('/elektro') },
      ],
    },
    {
      title: t.navigation.contact,
      links: [
        { label: t.navigation.dealers, href: href('/haendler') },
        { label: t.navigation.testDrive, href: href('/probefahrt') },
        { label: t.navigation.contact, href: href('/kontakt') },
      ],
    },
  ]

  return (
    <html lang={locale === 'de-de' ? 'de-DE' : 'en-GB'} className={inter.variable}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <AppProviders>
            <PageShell
              skipLinkLabel={t.navigation.skip}
              header={
                <SiteHeader
                  navItems={navItems}
                  locale={locale}
                  labels={{
                    mainNav: t.ui.mainNav,
                    mobileNav: t.ui.mobileNav,
                    openMenu: t.ui.openMenu,
                    closeMenu: t.ui.closeMenu,
                    homeLink: t.ui.homeLink,
                    search: t.navigation.search,
                    language: t.navigation.language,
                  }}
                  accountSlot={
                    <AccountStatus
                      locale={locale}
                      labels={{
                        signIn: t.account.login,
                        account: t.navigation.account,
                        loading: t.ui.accountLoading,
                        unavailable: t.ui.accountUnavailable,
                      }}
                    />
                  }
                />
              }
              footer={
                <SiteFooter
                  linkGroups={footerGroups}
                  legalLinks={[
                    { label: t.legal.imprint, href: `/${locale}/impressum` },
                    { label: t.legal.privacy, href: `/${locale}/datenschutz` },
                  ]}
                  locale={locale}
                  labels={{
                    footerNav: t.ui.footerNav,
                    legalNav: t.ui.legalNav,
                    homeLink: t.ui.homeLink,
                    copyright: formatLabel(t.ui.copyright, { year: new Date().getFullYear() }),
                  }}
                  utilitySlot={
                    <>
                      <ConsentSettingsButton label={t.consent.settings} />
                      <ThemeToggle label={t.common.darkMode} />
                    </>
                  }
                />
              }
              overlaySlot={<ConsentManager labels={t.consent} />}
            >
              {children}
            </PageShell>
          </AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}


import { env } from '@/lib/env'
import { routing } from '@/lib/i18n/routing'

import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = {
    'de-DE': new URL('/de-de', env.APP_BASE_URL).toString(),
    'en-GB': new URL('/en-gb', env.APP_BASE_URL).toString(),
    'x-default': new URL(`/${routing.defaultLocale}`, env.APP_BASE_URL).toString(),
  }

  return routing.locales.map((locale) => ({
    url: new URL(`/${locale}`, env.APP_BASE_URL).toString(),
    alternates: { languages },
  }))
}

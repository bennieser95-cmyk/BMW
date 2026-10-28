import { getRequestConfig } from 'next-intl/server'

import { defaultLocale, locales } from '@/lib/i18n/routing'
import { getMessages } from '@/lib/messages'

export default getRequestConfig(async ({ requestLocale }) => {
  const requestedLocale = await requestLocale
  const locale = locales.find((supportedLocale) => supportedLocale === requestedLocale) ?? defaultLocale

  return {
    locale,
    messages: getMessages(locale),
  }
})

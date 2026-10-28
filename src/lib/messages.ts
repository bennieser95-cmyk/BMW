import de from '@/messages/de.json'
import en from '@/messages/en.json'

export const locales = ['de-de', 'en-gb'] as const
export type Locale = (typeof locales)[number]
export type Messages = typeof de

const catalogs: Record<Locale, Messages> = { 'de-de': de, 'en-gb': en }

export function isSupportedLocale(locale: string | undefined): locale is Locale {
  return locales.some((supportedLocale) => supportedLocale === locale)
}

export function getMessages(locale: string): Messages {
  return catalogs[isSupportedLocale(locale) ? locale : 'de-de']
}

export function getLocaleFromPath(pathname: string): Locale {
  const pathLocale = pathname.split('/')[1]
  return isSupportedLocale(pathLocale) ? pathLocale : 'de-de'
}

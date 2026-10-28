import { getTranslations } from 'next-intl/server'

export default async function Loading(): Promise<React.ReactNode> {
  const translate = await getTranslations('common')

  return (
    <main aria-busy="true">
      <p>{translate('loading')}</p>
    </main>
  )
}

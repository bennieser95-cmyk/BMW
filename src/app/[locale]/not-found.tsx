import { useTranslations } from 'next-intl'

import { Link } from '@/lib/i18n/navigation'

export default function NotFoundPage(): React.ReactNode {
  const translate = useTranslations('common')

  return (
    <main className="page-error">
      <h1>{translate('notFound')}</h1>
      <Link className="button button-primary" href="/">
        {translate('home')}
      </Link>
    </main>
  )
}

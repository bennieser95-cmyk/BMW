import Link from 'next/link'

export default async function OfflinePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return <main className="page-error"><p className="eyebrow">BAVARIA / OFFLINE</p><h1>{locale === 'de-de' ? 'Sie sind offline.' : 'You are offline.'}</h1><p>{locale === 'de-de' ? 'Prüfen Sie Ihre Verbindung und versuchen Sie es erneut.' : 'Check your connection and try again.'}</p><Link className="button button-primary" href={`/${locale}`}>{locale === 'de-de' ? 'Startseite' : 'Home'}</Link></main>
}

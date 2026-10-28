import Link from 'next/link'

export interface BreadcrumbItem {
  label: string
  href?: string
}

export function Breadcrumbs({ items, locale }: { items: BreadcrumbItem[]; locale: string }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: item.href ? `${process.env.APP_BASE_URL ?? 'https://example.invalid'}${item.href}` : undefined,
    })),
  }
  return (
    <>
      <nav aria-label={locale === 'de-de' ? 'Brotkrumennavigation' : 'Breadcrumb'} className="breadcrumbs">
        <ol>{items.map((item, index) => <li key={`${item.label}-${index}`}>
          {item.href ? <Link href={item.href}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}
        </li>)}</ol>
      </nav>
      <script dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }} type="application/ld+json" />
    </>
  )
}

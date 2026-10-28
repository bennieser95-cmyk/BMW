import NextLink from 'next/link'

import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/cn'
import { serializeJsonLd } from '@/lib/json-ld'

export interface BreadcrumbItem {
  label: string
  /** Omit on the last item: it represents the current page. */
  href?: string
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[]
  /** Accessible name of the nav landmark, e.g. "Brotkrumennavigation". */
  label: string
  /** Absolute origin for JSON-LD item URLs, e.g. "https://bavaria.example". */
  baseUrl: string
  className?: string
}

/** Breadcrumb trail with schema.org BreadcrumbList for rich results. */
export function Breadcrumb({ items, label, baseUrl, className }: BreadcrumbProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: new URL(item.href, baseUrl).toString() } : {}),
    })),
  }

  return (
    <nav aria-label={label} className={cn('text-sm', className)}>
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1">
              {index > 0 ? (
                <Icon name="chevron-right" size="sm" className="text-text-muted rtl:rotate-180" />
              ) : null}
              {item.href && !isCurrent ? (
                <NextLink
                  href={item.href}
                  className="inline-flex min-h-touch items-center text-text-muted underline-offset-4 hover:text-text hover:underline"
                >
                  {item.label}
                </NextLink>
              ) : (
                <span aria-current={isCurrent ? 'page' : undefined} className="font-medium text-text">
                  {item.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
      <script
        type="application/ld+json"
        // Safe: serializeJsonLd escapes "<" so content cannot terminate the script tag.
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
    </nav>
  )
}

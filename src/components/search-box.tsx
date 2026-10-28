'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import type { Vehicle } from '@/domain/vehicle/vehicle.types'
import { getMessages } from '@/lib/messages'

export function SearchBox({
  models,
  locale,
  initialQuery,
}: {
  models: Vehicle[]
  locale: string
  initialQuery: string
}) {
  const messages = getMessages(locale)
  const [query, setQuery] = useState(initialQuery)
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery)
  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), 250)
    return () => window.clearTimeout(timer)
  }, [query])
  const normalized = debouncedQuery.trim().toLocaleLowerCase(locale)
  const results = normalized
    ? models.filter((model) =>
        `${model.name} ${model.bodyType} ${model.fuelType}`
          .toLocaleLowerCase(locale)
          .includes(normalized),
      )
    : []
  return (
    <>
      <form action={`/${locale}/suche`} className="search-form" role="search">
        <label className="field">
          {messages.search.placeholder}
          <input
            autoComplete="off"
            name="q"
            onChange={(event) => setQuery(event.target.value)}
            placeholder={messages.search.placeholder}
            value={query}
          />
        </label>
        <button className="button button-primary" type="submit">
          {messages.navigation.search}
        </button>
      </form>
      <p aria-live="polite" className="result-count">
        {normalized ? `${results.length}` : ''}
      </p>
      {normalized && results.length > 0 ? (
        <div className="search-results">
          {results.map((model) => (
            <article className="search-result" key={model.id}>
              <Link href={`/${locale}/modelle/${model.slug}`}>{model.name}</Link>
              <p>
                {model.bodyType} · {model.fuelType}
              </p>
            </article>
          ))}
        </div>
      ) : normalized ? (
        <p>{messages.search.noResults}</p>
      ) : null}
    </>
  )
}

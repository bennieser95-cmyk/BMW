'use client'

import { useMemo, useState } from 'react'

import type { Dealer } from '@/features/dealers/mock-dealers.queries'
import { getMessages } from '@/lib/messages'

export function DealerResults({ dealers, locale }: { dealers: Dealer[]; locale: string }) {
  const messages = getMessages(locale)
  const [selectedId, setSelectedId] = useState(dealers[0]?.id ?? '')
  const [service, setService] = useState('')
  const visibleDealers = useMemo(
    () => (service ? dealers.filter((dealer) => dealer.services.includes(service)) : dealers),
    [dealers, service],
  )
  return (
    <div className="dealer-layout">
      <section aria-label={messages.navigation.dealers} className="dealer-list">
        <label className="field">
          {messages.dealers.serviceFilter}
          <select onChange={(event) => setService(event.target.value)} value={service}>
            <option value="">{messages.dealers.allServices}</option>
            <option value="sales">{messages.dealers.sales}</option>
            <option value="workshop">{messages.dealers.workshop}</option>
            <option value="charging">{messages.dealers.charging}</option>
          </select>
        </label>
        {visibleDealers.map((dealer) => (
          <article
            aria-current={selectedId === dealer.id ? 'true' : undefined}
            className="dealer-card"
            key={dealer.id}
            onMouseEnter={() => setSelectedId(dealer.id)}
            onFocus={() => setSelectedId(dealer.id)}
          >
            <h2>{dealer.name}</h2>
            <p>
              {dealer.address}
              <br />
              {dealer.postalCode} {dealer.city}
            </p>
            <ul>
              {dealer.services.map((service) => (
                <li key={service}>
                  {service === 'sales'
                    ? messages.dealers.sales
                    : service === 'workshop'
                      ? messages.dealers.workshop
                      : messages.dealers.charging}
                </li>
              ))}
            </ul>
            <a href={`/${locale}/probefahrt?dealer=${dealer.id}`}>
              {messages.navigation.testDrive}
            </a>
          </article>
        ))}
        {!visibleDealers.length && <p role="status">{messages.dealers.noResults}</p>}
      </section>
      <section aria-label={messages.dealers.map} className="dealer-map" role="region">
        <p>{messages.dealers.map} · OpenStreetMap / MapLibre (Mock)</p>
        <div className="map-markers">
          {visibleDealers.map((dealer, index) => (
            <button
              aria-label={`${dealer.name}, ${dealer.city}`}
              aria-pressed={selectedId === dealer.id}
              key={dealer.id}
              onClick={() => setSelectedId(dealer.id)}
              style={{ transform: `translateY(${index % 2 ? '20px' : '-12px'})` }}
              type="button"
            >
              {index + 1}
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}

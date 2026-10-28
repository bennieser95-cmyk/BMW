'use client'

import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs'
import { useMemo } from 'react'

import { ModelCard } from '@/components/model-card'
import type { Vehicle } from '@/domain/vehicle/vehicle.types'
import { getMessages } from '@/lib/messages'
import { track } from '@/lib/track'

export function ModelFilter({ models, locale }: { models: Vehicle[]; locale: string }) {
  const messages = getMessages(locale)
  const [filters, setFilters] = useQueryStates(
    {
      antrieb: parseAsString.withDefault(''),
      karosserie: parseAsString.withDefault(''),
      maxPreis: parseAsInteger.withDefault(100000),
      minLeistung: parseAsInteger.withDefault(0),
      sort: parseAsString.withDefault('newest'),
    },
    { shallow: true },
  )

  const filtered = useMemo(() => {
    const result = models.filter(
      (model) =>
        (!filters.antrieb ||
          model.fuelType === (filters.antrieb === 'elektro' ? 'electric' : filters.antrieb)) &&
        (!filters.karosserie || model.bodyType === filters.karosserie) &&
        model.basePriceCents / 100 <= filters.maxPreis &&
        model.powerKw >= filters.minLeistung,
    )
    if (filters.sort === 'priceAsc') result.sort((a, b) => a.basePriceCents - b.basePriceCents)
    if (filters.sort === 'priceDesc') result.sort((a, b) => b.basePriceCents - a.basePriceCents)
    if (filters.sort === 'name') result.sort((a, b) => a.name.localeCompare(b.name, locale))
    return result
  }, [filters, locale, models])

  async function handleFuelChange(value: string) {
    const filterValue = value === 'electric' && locale === 'de-de' ? 'elektro' : value
    await setFilters({ antrieb: filterValue })
    const fuelType = filterValue === 'elektro' ? 'electric' : filterValue
    const resultCount = models.filter(
      (model) =>
        (!fuelType || model.fuelType === fuelType) &&
        (!filters.karosserie || model.bodyType === filters.karosserie) &&
        model.basePriceCents / 100 <= filters.maxPreis &&
        model.powerKw >= filters.minLeistung,
    ).length
    track('model_filter_applied', { filterType: 'fuelType', value: filterValue, resultCount })
  }

  return (
    <>
      <form
        aria-label={messages.models.title}
        className="filter-bar"
        onSubmit={(event) => event.preventDefault()}
      >
        <label>
          {messages.models.fuelType}
          <select
            onChange={(event) => void handleFuelChange(event.target.value)}
            value={filters.antrieb}
          >
            <option value="">{messages.models.all}</option>
            <option value="petrol">{messages.vehicle.fuelTypes.petrol}</option>
            <option value="diesel">{messages.vehicle.fuelTypes.diesel}</option>
            <option value="hybrid">{messages.vehicle.fuelTypes.hybrid}</option>
            <option value={locale === 'de-de' ? 'elektro' : 'electric'}>
              {messages.vehicle.fuelTypes.electric}
            </option>
          </select>
        </label>
        <label>
          {messages.models.bodyType}
          <select
            onChange={(event) => void setFilters({ karosserie: event.target.value })}
            value={filters.karosserie}
          >
            <option value="">{messages.models.all}</option>
            <option value="sedan">{messages.vehicle.bodyTypes.sedan}</option>
            <option value="suv">{messages.vehicle.bodyTypes.suv}</option>
            <option value="coupe">{messages.vehicle.bodyTypes.coupe}</option>
            <option value="touring">{messages.vehicle.bodyTypes.touring}</option>
          </select>
        </label>
        <label>
          {messages.models.price}
          <input
            max="100000"
            min="30000"
            onChange={(event) => void setFilters({ maxPreis: Number(event.target.value) })}
            step="5000"
            type="range"
            value={filters.maxPreis}
          />
          <span>
            {new Intl.NumberFormat(locale, {
              style: 'currency',
              currency: 'EUR',
              maximumFractionDigits: 0,
            }).format(filters.maxPreis)}
          </span>
        </label>
        <label>
          {messages.models.power}
          <input
            max="300"
            min="0"
            onChange={(event) => void setFilters({ minLeistung: Number(event.target.value) })}
            step="10"
            type="range"
            value={filters.minLeistung}
          />
          <span>{filters.minLeistung} kW</span>
        </label>
        <label>
          {messages.models.sort}
          <select
            onChange={(event) => void setFilters({ sort: event.target.value })}
            value={filters.sort}
          >
            <option value="newest">{messages.models.newest}</option>
            <option value="priceAsc">{messages.models.priceAsc}</option>
            <option value="priceDesc">{messages.models.priceDesc}</option>
            <option value="name">{messages.models.name}</option>
          </select>
        </label>
      </form>
      <p aria-live="polite" className="result-count">
        {messages.models.results.replace('{count}', String(filtered.length))}
      </p>
      {filtered.length ? (
        <div className="model-grid">
          {filtered.map((vehicle) => (
            <ModelCard key={vehicle.id} locale={locale} vehicle={vehicle} />
          ))}
        </div>
      ) : (
        <p className="empty-state">{messages.models.empty}</p>
      )}
    </>
  )
}

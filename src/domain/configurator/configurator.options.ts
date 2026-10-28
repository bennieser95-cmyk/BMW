import type { ConfigOption } from './configurator.types'

export const CONFIGURATOR_OPTIONS: readonly ConfigOption[] = [
  { id: 'engine-standard', category: 'engine', priceDeltaCents: 0 },
  { id: 'engine-power', category: 'engine', priceDeltaCents: 350000 },
  { id: 'paint-cloud', category: 'paint', priceDeltaCents: 0 },
  { id: 'paint-grey', category: 'paint', priceDeltaCents: 125000 },
  { id: 'paint-red', category: 'paint', priceDeltaCents: 90000 },
  { id: 'wheel-flow', category: 'wheels', priceDeltaCents: 0 },
  {
    id: 'wheel-sport',
    category: 'wheels',
    priceDeltaCents: 80000,
    requires: ['engine-standard'],
    excludes: ['package-track'],
  },
  { id: 'interior-stone', category: 'interior', priceDeltaCents: 0 },
  { id: 'interior-dark', category: 'interior', priceDeltaCents: 65000 },
  { id: 'package-comfort', category: 'package', priceDeltaCents: 190000 },
  { id: 'package-track', category: 'package', priceDeltaCents: 280000, excludes: ['wheel-sport'] },
]

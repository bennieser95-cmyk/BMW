import fc from 'fast-check'
import { describe, expect, it } from 'vitest'

import {
  applySelection,
  buildConfigurationCode,
  calculateTotalPrice,
  parseConfigurationCode,
} from './configurator.engine'

import type { ConfigOption, Configuration } from './configurator.types'

const options: ConfigOption[] = [
  { id: 'engine-standard', category: 'engine', priceDeltaCents: 0 },
  { id: 'paint-blue', category: 'paint', priceDeltaCents: 125000 },
  { id: 'wheel-sport', category: 'wheels', priceDeltaCents: 80000, requires: ['engine-standard'] },
  { id: 'package-sport', category: 'package', priceDeltaCents: 200000, excludes: ['wheel-sport'] },
]
const initial: Configuration = { modelSlug: 'aurelia', basePriceCents: 4200000, selections: [] }

function getOption(optionId: string): ConfigOption {
  const option = options.find((candidate) => candidate.id === optionId)
  if (!option) throw new Error(`Unknown test option: ${optionId}`)
  return option
}

describe('configurator engine', () => {
  it('applies compatible options without mutating the source config', () => {
    const result = applySelection(initial, getOption('engine-standard'))
    expect(result.ok).toBe(true)
    expect(initial.selections).toHaveLength(0)
  })

  it('rejects a missing requirement and an exclusion', () => {
    expect(applySelection(initial, getOption('wheel-sport'))).toMatchObject({
      ok: false,
      error: { code: 'REQUIRES', relatedOptionId: 'engine-standard' },
    })
    const selected = { ...initial, selections: [getOption('wheel-sport')] }
    expect(applySelection(selected, getOption('package-sport'))).toMatchObject({
      ok: false,
      error: { code: 'EXCLUDES', relatedOptionId: 'wheel-sport' },
    })
  })

  it('keeps only one selection per category', () => {
    const standardEngine = getOption('engine-standard')
    const config = { ...initial, selections: [standardEngine] }
    expect(applySelection(config, { ...standardEngine, id: 'engine-plus' })).toMatchObject({
      ok: false,
      error: { code: 'DUPLICATE_CATEGORY' },
    })
  })

  it('calculates total price from integer cents', () => {
    expect(
      calculateTotalPrice({
        ...initial,
        selections: [getOption('paint-blue'), getOption('wheel-sport')],
      }),
    ).toBe(4_405_000)
  })

  it('round-trips compatible selections through a shareable code', () => {
    const config = {
      ...initial,
      selections: [getOption('engine-standard'), getOption('paint-blue'), getOption('wheel-sport')],
    }
    const code = buildConfigurationCode(config)
    expect(parseConfigurationCode(code, options, initial.basePriceCents)).toEqual({
      ok: true,
      value: config,
    })
  })

  it('rejects unknown and malformed configuration codes', () => {
    expect(parseConfigurationCode('v1.aurelia.unknown', options, 100)).toMatchObject({ ok: false })
    expect(parseConfigurationCode('bad', options, 100)).toMatchObject({ ok: false })
  })

  it('property: calculated total is base price plus all selected deltas', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1_000_000_000 }),
        fc.array(fc.integer({ min: -100_000, max: 100_000 }), { maxLength: 10 }),
        (base, deltas) => {
          const config: Configuration = {
            modelSlug: 'synthetic',
            basePriceCents: base,
            selections: deltas.map((priceDeltaCents, index) => ({
              id: `opt-${index}`,
              category: 'package',
              priceDeltaCents,
            })),
          }
          expect(calculateTotalPrice(config)).toBe(
            base + deltas.reduce((sum, delta) => sum + delta, 0),
          )
        },
      ),
    )
  })
})

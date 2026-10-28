import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import { modelQuerySchema } from '@/lib/api/request.schema'
import { createCatalogService } from '@/lib/backend/catalog.service'

import { createCmsAdapter } from './mock-cms.adapter'
import dataset from './showroom.json'

vi.mock('server-only', () => ({}))
vi.mock('@/lib/env', () => ({ env: {} }))

const server = setupServer()
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('CMS port integration with MSW', () => {
  it('maps validated remote models, variants, options and dealer coordinates', async () => {
    server.use(http.get('https://cms.example.invalid/showroom', () => HttpResponse.json(dataset)))
    const cms = createCmsAdapter('https://cms.example.invalid')
    const models = await cms.findModels()
    expect(models.length).toBeGreaterThanOrEqual(8)
    expect(models.every((model) => model.name.length > 0 && model.variants?.length)).toBe(true)
    expect((await cms.findDealers()).every((dealer) => Number.isFinite(dealer.geo.lat) && Number.isFinite(dealer.geo.lon))).toBe(true)
    const firstModel = models[0]
    if (!firstModel) throw new Error('Expected catalog fixture')
    const options = await cms.findOptionsByModelSlug(firstModel.slug)
    expect(options?.some((option) => option.requires?.length && option.excludes?.length)).toBe(true)
    expect(await cms.findModelBySlug('does-not-exist')).toBeNull()
  })
  it('does not silently replace unavailable or malformed remote data with mock data', async () => {
    const cms = createCmsAdapter('https://cms.example.invalid')
    server.use(http.get('https://cms.example.invalid/showroom', () => new HttpResponse(null, { status: 503 })))
    await expect(cms.findModels()).rejects.toThrow()
    server.use(http.get('https://cms.example.invalid/showroom', () => HttpResponse.json({ models: [] })))
    await expect(cms.findModels()).rejects.toThrow()
  })
})

describe('catalog server pricing through the existing configurator engine', () => {
  const catalog = createCatalogService(createCmsAdapter())
  const firstModel = dataset.models[0]
  if (!firstModel) throw new Error('Expected catalog fixture')
  const slug = firstModel.slug
  it('returns paginated catalog data and trusted integer-cent prices', async () => {
    const result = await catalog.models(modelQuerySchema.parse({ pageSize: 2 }))
    expect(result.models).toHaveLength(2)
    expect(result.totalCount).toBeGreaterThanOrEqual(8)
    const price = await catalog.price({ modelSlug: slug, optionIds: [] })
    expect(price).toEqual({ totalPriceCents: firstModel.basePriceCents, currency: 'EUR' })
  })
  it('resolves requires independently of input order and rejects excludes and unknown options', async () => {
    const ids = ['engine-standard', 'wheel-sport']
    expect(await catalog.price({ modelSlug: slug, optionIds: ids }))
      .toEqual(await catalog.price({ modelSlug: slug, optionIds: [...ids].reverse() }))
    await expect(catalog.price({ modelSlug: slug, optionIds: ['wheel-sport'] })).rejects.toThrow()
    await expect(catalog.price({ modelSlug: slug, optionIds: [...ids, 'package-track'] })).rejects.toThrow()
    await expect(catalog.price({ modelSlug: slug, optionIds: ['forged-option'] })).rejects.toThrow()
  })
})

import 'server-only'

import type { CmsPort } from '@/domain/cms/cms.port'
import { applySelection, calculateTotalPrice } from '@/domain/configurator/configurator.engine'
import type { Configuration } from '@/domain/configurator/configurator.types'
import { NotFoundError, ValidationError } from '@/domain/shared/domain-error'
import type { ModelQuery, PriceRequest } from '@/lib/api/request.schema'

export function createCatalogService(cms: CmsPort) {
  return {
    async models(query: ModelQuery) {
      const fuelType = query.fuelType === 'elektro' ? 'electric' : query.fuelType
      const models = (await cms.findModels()).filter((model) =>
        (!query.bodyType || model.bodyType === query.bodyType) &&
        (!fuelType || model.fuelType === fuelType) &&
        (query.minPriceCents === undefined || model.basePriceCents >= query.minPriceCents) &&
        (query.maxPriceCents === undefined || model.basePriceCents <= query.maxPriceCents) &&
        (query.minPowerKw === undefined || model.powerKw >= query.minPowerKw) &&
        (query.maxPowerKw === undefined || model.powerKw <= query.maxPowerKw),
      )
      if (query.sort === 'priceAsc') models.sort((a, b) => a.basePriceCents - b.basePriceCents)
      if (query.sort === 'priceDesc') models.sort((a, b) => b.basePriceCents - a.basePriceCents)
      if (query.sort === 'name') models.sort((a, b) => a.name.localeCompare(b.name))
      return {
        models: models.slice((query.page - 1) * query.pageSize, query.page * query.pageSize),
        totalCount: models.length, page: query.page, pageSize: query.pageSize, currency: 'EUR',
      }
    },
    async model(slug: string) {
      const model = await cms.findModelBySlug(slug)
      if (!model) throw new NotFoundError('Model not found')
      return { ...model, currency: 'EUR' }
    },
    async options(slug: string) {
      const options = await cms.findOptionsByModelSlug(slug)
      if (!options) throw new NotFoundError('Model not found')
      return { modelSlug: slug, options, currency: 'EUR' }
    },
    async price(input: PriceRequest) {
      const model = await cms.findModelBySlug(input.modelSlug)
      const options = await cms.findOptionsByModelSlug(input.modelSlug)
      if (!model || !options) throw new NotFoundError('Model not found')
      let config: Configuration = { modelSlug: model.slug, basePriceCents: model.basePriceCents, selections: [] }
      const remaining = new Set(input.optionIds)
      // Resolve prerequisites before invoking the existing domain engine; request order is irrelevant.
      while (remaining.size > 0) {
        const option = options.find((candidate) => remaining.has(candidate.id) &&
          (candidate.requires ?? []).every((id) => config.selections.some((selected) => selected.id === id)))
        if (!option) throw new ValidationError('Invalid configuration')
        const result = applySelection(config, option)
        if (!result.ok) throw new ValidationError('Invalid configuration', result.error.code)
        config = result.value
        remaining.delete(option.id)
      }
      const totalPriceCents = calculateTotalPrice(config)
      if (!Number.isSafeInteger(totalPriceCents) || totalPriceCents < 0) throw new ValidationError('Invalid price')
      return { totalPriceCents, currency: 'EUR' }
    },
  }
}

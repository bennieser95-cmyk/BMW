import 'server-only'

import type { CmsPort } from '@/domain/cms/cms.port'
import { CONFIGURATOR_OPTIONS } from '@/domain/configurator/configurator.options'
import { ServiceUnavailableError } from '@/domain/shared/domain-error'
import { env } from '@/lib/env'

import { mapCmsModelToModel } from './cms-model-to-model.mapper'
import { cmsDatasetSchema } from './cms.schema'
import dataset from './showroom.json'

export function createCmsAdapter(baseUrl?: string, token?: string): CmsPort {
  async function load(modelSlug?: string): Promise<ReturnType<typeof cmsDatasetSchema.parse>> {
    let payload: unknown = dataset
    if (baseUrl) {
      const response = await fetch(new URL('showroom', `${baseUrl.replace(/\/$/, '')}/`), {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        signal: AbortSignal.timeout(8000),
        next: { revalidate: 60, tags: ['models', 'content', ...(modelSlug ? [`model:${modelSlug}`] : [])] },
      })
      if (!response.ok) throw new ServiceUnavailableError('CMS_UPSTREAM_ERROR')
      payload = await response.json()
    }
    const parsed = cmsDatasetSchema.safeParse(payload)
    if (!parsed.success) throw new ServiceUnavailableError('INVALID_CMS_RESPONSE')
    return parsed.data
  }
  return {
    async findModels() {
      return (await load()).models.map(mapCmsModelToModel)
    },
    async findModelBySlug(slug) {
      const model = (await load(slug)).models.find((candidate) => candidate.slug === slug)
      return model ? mapCmsModelToModel(model) : null
    },
    async findOptionsByModelSlug(slug) {
      return (await load(slug)).models.some((model) => model.slug === slug)
        ? CONFIGURATOR_OPTIONS
        : null
    },
    async findDealers() {
      return (await load()).dealers
    },
  }
}

export const mockCmsAdapter = createCmsAdapter(env.CMS_API_URL, env.CMS_API_TOKEN)
export const getModels = mockCmsAdapter.findModels
export const getModelBySlug = mockCmsAdapter.findModelBySlug

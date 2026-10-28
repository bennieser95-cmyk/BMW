import 'server-only'

import type { Vehicle } from '@/domain/vehicle/vehicle.types'
import { mockCmsAdapter } from '@/infrastructure/cms/mock-cms.adapter'

export async function getModels(): Promise<Vehicle[]> {
  return [...(await mockCmsAdapter.findModels())]
}

export async function getModelBySlug(slug: string): Promise<Vehicle | undefined> {
  return (await mockCmsAdapter.findModelBySlug(slug)) ?? undefined
}

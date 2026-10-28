import { z } from 'zod'

import { slugSchema } from '@/lib/api/request.schema'

export const cmsModelSchema = z.object({
  slug: slugSchema,
  name: z.string().min(1).max(100),
  bodyType: z.enum(['sedan', 'touring', 'suv', 'coupe']),
  fuelType: z.enum(['petrol', 'diesel', 'hybrid', 'electric']),
  basePriceCents: z.number().int().nonnegative().max(1000000000),
  powerKw: z.number().int().nonnegative(),
  rangeKm: z.number().int().nonnegative(),
})
export const dealerSchema = z.object({
  id: slugSchema,
  name: z.string().min(1),
  city: z.string().min(1),
  postalCode: z.string().regex(/^\d{5}$/),
  address: z.string().min(1),
  geo: z.object({ lat: z.number().min(-90).max(90), lon: z.number().min(-180).max(180) }),
  services: z.array(z.string()).max(20),
})
export const cmsDatasetSchema = z.object({
  models: z.array(cmsModelSchema).min(1).max(500),
  dealers: z.array(dealerSchema).min(1).max(5000),
})
export type CmsModel = z.infer<typeof cmsModelSchema>

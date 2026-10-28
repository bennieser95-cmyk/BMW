import { z } from 'zod'

import { cmsModelSchema, dealerSchema } from '@/infrastructure/cms/cms.schema'

import { idSchema, slugSchema } from './request.schema'

export const optionResponseSchema = z.object({
  id: slugSchema,
  category: z.enum(['engine', 'paint', 'wheels', 'interior', 'package']),
  priceDeltaCents: z.number().int(),
  requires: z.array(slugSchema).optional(),
  excludes: z.array(slugSchema).optional(),
})
export const modelResponseSchema = cmsModelSchema.extend({
  id: z.string(),
  consumption: z.string(),
  heroImage: z.object({
    url: z.string(),
    alt: z.string(),
    width: z.number().int(),
    height: z.number().int(),
  }),
  highlights: z.array(z.string()),
  variants: z.array(
    z.object({
      id: z.string(),
      engineCode: slugSchema,
      powerKw: z.number().int(),
      fuelType: cmsModelSchema.shape.fuelType,
      optionIds: z.array(slugSchema),
    }),
  ),
})
export const configurationResponseSchema = z.object({
  id: idSchema,
  userId: z.string(),
  modelSlug: slugSchema,
  name: z.string(),
  configurationCode: z.string(),
  createdAt: z.iso.datetime(),
})
export const priceResponseSchema = z.object({
  totalPriceCents: z.number().int().nonnegative(),
  currency: z.literal('EUR'),
})
export const problemResponseSchema = z.object({
  type: z.string(),
  title: z.string(),
  status: z.number().int(),
  traceId: z.string(),
  detail: z.string().optional(),
  instance: z.string().optional(),
  errors: z.array(z.object({ field: z.string(), code: z.string() })).optional(),
})
export const pageResponseShape = {
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1).max(50),
  totalCount: z.number().int().nonnegative(),
}
export const modelsResponseSchema = z.object({
  ...pageResponseShape,
  models: z.array(modelResponseSchema),
  currency: z.literal('EUR'),
})
export const dealersResponseSchema = z.object({
  ...pageResponseShape,
  dealers: z.array(dealerSchema),
})
export const configurationsResponseSchema = z.object({
  ...pageResponseShape,
  configurations: z.array(configurationResponseSchema),
})
export const exportResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.email(),
    name: z.string().optional(),
    emailVerified: z.boolean().optional(),
  }),
  exportedAt: z.iso.datetime(),
  configurations: z.array(configurationResponseSchema),
  leads: z.array(
    z.object({
      id: idSchema,
      kind: z.enum(['contact', 'test-drive']),
      userId: z.string(),
      firstName: z.string(),
      lastName: z.string(),
      email: z.email(),
      phone: z.string().optional(),
      modelSlug: slugSchema.optional(),
      dealerId: slugSchema.optional(),
      requestedDate: z.iso.date().optional(),
      consentAt: z.iso.datetime(),
      createdAt: z.iso.datetime(),
    }),
  ),
})

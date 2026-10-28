import { z } from 'zod'

export const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100)
export const idSchema = z.uuid()
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).max(100000).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
})
export const modelQuerySchema = paginationSchema.extend({
  bodyType: z.enum(['sedan', 'touring', 'suv', 'coupe']).optional(),
  fuelType: z.enum(['petrol', 'diesel', 'hybrid', 'electric', 'elektro']).optional(),
  minPriceCents: z.coerce.number().int().nonnegative().optional(),
  maxPriceCents: z.coerce.number().int().nonnegative().optional(),
  minPowerKw: z.coerce.number().int().nonnegative().optional(),
  maxPowerKw: z.coerce.number().int().nonnegative().optional(),
  sort: z.enum(['priceAsc', 'priceDesc', 'name', 'newest']).default('name'),
}).strict()
export const dealerQuerySchema = paginationSchema.extend({
  postalCode: z.string().regex(/^\d{5}$/).optional(),
}).strict()
export const priceRequestSchema = z.object({
  modelSlug: slugSchema,
  optionIds: z.array(slugSchema).max(20).refine((ids) => new Set(ids).size === ids.length),
}).strict()
export const configurationSchema = z.object({
  modelSlug: slugSchema,
  configurationCode: z.string().min(1).max(2000),
  name: z.string().trim().min(1).max(80),
}).strict()
export const renameConfigurationSchema = configurationSchema.pick({ name: true })
export const deleteAccountSchema = z.object({
  password: z.string().min(1).max(128).optional(),
}).strict()
export const revalidationSchema = z.object({
  tag: z.string().regex(/^(content|models|model:[a-z0-9-]+)$/).max(110),
}).strict()
export type ModelQuery = z.infer<typeof modelQuerySchema>
export type PriceRequest = z.infer<typeof priceRequestSchema>

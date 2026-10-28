'use client'

import { z } from 'zod'

export type TrackingEvent =
  | 'page_view'
  | 'model_filter_applied'
  | 'model_card_click'
  | 'configurator_step_completed'
  | 'configurator_shared'
  | 'dealer_search_submitted'
  | 'lead_submitted'
  | 'consent_updated'

const eventSchema = z.discriminatedUnion('event', [
  z.object({
    event: z.literal('page_view'),
    params: z.object({
      path: z.string().regex(/^\/[a-z]{2}-[a-z]{2}(?:\/[a-z0-9/-]*)?$/),
      locale: z.enum(['de-de', 'en-gb']),
      title: z.string().max(120).refine((value) => !/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.test(value)),
    }).strict(),
  }),
  z.object({
    event: z.literal('model_filter_applied'),
    params: z.object({
      filterType: z.enum(['fuelType', 'bodyType', 'price', 'power']),
      value: z.enum(['', 'petrol', 'diesel', 'hybrid', 'electric', 'elektro', 'sedan', 'suv', 'coupe', 'touring']),
      resultCount: z.number().int().nonnegative(),
    }).strict(),
  }),
  z.object({
    event: z.literal('model_card_click'),
    params: z.object({ modelSlug: z.string().regex(/^[a-z0-9-]+$/), position: z.number().int().positive() }).strict(),
  }),
  z.object({
    event: z.literal('configurator_step_completed'),
    params: z.object({
      modelSlug: z.string().regex(/^[a-z0-9-]+$/),
      step: z.number().int().min(0).max(5),
      totalPriceCents: z.number().int().nonnegative(),
    }).strict(),
  }),
  z.object({
    event: z.literal('configurator_shared'),
    params: z.object({ modelSlug: z.string().regex(/^[a-z0-9-]+$/), method: z.enum(['clipboard', 'native']) }).strict(),
  }),
  z.object({
    event: z.literal('dealer_search_submitted'),
    params: z.object({ hasGeolocation: z.boolean(), resultCount: z.number().int().nonnegative() }).strict(),
  }),
  z.object({
    event: z.literal('lead_submitted'),
    params: z.object({ leadType: z.enum(['test-drive', 'contact']), modelSlug: z.string().regex(/^[a-z0-9-]+$/).optional() }).strict(),
  }),
  z.object({
    event: z.literal('consent_updated'),
    params: z.object({ categories: z.array(z.enum(['necessary', 'statistics', 'marketing'])) }).strict(),
  }),
])

export function track(event: TrackingEvent, params: Record<string, string | number | boolean | string[]>): void {
  const storedConsent = window.localStorage.getItem('bavaria-consent')
  if (!storedConsent) return
  try {
    const consent: unknown = JSON.parse(storedConsent)
    if (typeof consent !== 'object' || consent === null || !('statistics' in consent) || consent.statistics !== true) return
  } catch {
    return
  }
  const parsed = eventSchema.safeParse({ event, params })
  if (!parsed.success) return
  window.dispatchEvent(new CustomEvent('bavaria:track', { detail: parsed.data }))
}

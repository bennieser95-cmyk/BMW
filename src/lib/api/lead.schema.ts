import { z } from 'zod'

import { slugSchema } from './request.schema'

const optionalSlug = z.union([slugSchema, z.literal('')]).optional()
export const leadSchema = z
  .object({
    leadType: z.enum(['test-drive', 'contact']),
    modelSlug: optionalSlug,
    requestedDate: z.union([z.iso.date(), z.literal('')]).optional(),
    dealerId: optionalSlug,
    firstName: z.string().trim().min(1).max(80),
    lastName: z.string().trim().min(1).max(80),
    email: z.email().max(254),
    phone: z.string().trim().max(40).optional(),
    consent: z.boolean().refine((value) => value, 'Consent is required'),
    honeypot: z.string().max(0),
  })
  .strict()
  .superRefine((lead, context) => {
    if (lead.leadType !== 'test-drive') return
    for (const field of ['modelSlug', 'requestedDate', 'dealerId'] as const) {
      if (!lead[field]) context.addIssue({ code: 'custom', path: [field], message: 'Required' })
    }
    if (lead.requestedDate && lead.requestedDate < new Date().toISOString().slice(0, 10)) {
      context.addIssue({
        code: 'custom',
        path: ['requestedDate'],
        message: 'Date must not be in the past',
      })
    }
  })
export type Lead = z.infer<typeof leadSchema>

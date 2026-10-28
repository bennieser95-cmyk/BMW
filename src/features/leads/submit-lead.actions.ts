'use server'

import { headers } from 'next/headers'

import { assertOrigin, handleRoute, json } from '@/lib/api/http'
import { leadSchema } from '@/lib/api/lead.schema'
import { limitRequest } from '@/lib/backend/request-security'
import { leads, security } from '@/lib/backend/services'

export type LeadActionResult = { success: true } | { success: false; message: string }

export async function submitLeadAction(formData: FormData): Promise<LeadActionResult> {
  const requestHeaders = new Headers(await headers())
  const response = await handleRoute(
    new Request('https://showroom.invalid/actions/submit-lead'),
    async () => {
      assertOrigin(requestHeaders)
      await limitRequest(requestHeaders, security, 'leads')
      const raw = Object.fromEntries(formData)
      const parsed = leadSchema.parse({ ...raw, consent: raw.consent === 'on' })
      await leads.create(parsed)
      return json({ success: true })
    },
  )
  if (!response.ok)
    return { success: false, message: 'Request could not be processed. Please try again.' }
  return { success: true }
}

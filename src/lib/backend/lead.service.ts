import 'server-only'

import type { AuthPort } from '@/domain/auth/auth.port'
import type { CmsPort } from '@/domain/cms/cms.port'
import type { LeadRepositoryPort } from '@/domain/lead/lead.port'
import { ValidationError } from '@/domain/shared/domain-error'
import type { Lead } from '@/lib/api/lead.schema'

export function createLeadService(auth: AuthPort, cms: CmsPort, repository: LeadRepositoryPort) {
  return {
    async create(input: Lead) {
      if (input.honeypot || !input.consent) throw new ValidationError('Invalid lead')
      if (input.modelSlug && !(await cms.findModelBySlug(input.modelSlug)))
        throw new ValidationError('Invalid model')
      if (input.dealerId && !(await cms.findDealers()).some(({ id }) => id === input.dealerId)) {
        throw new ValidationError('Invalid dealer')
      }
      const user = await auth.getCurrentUser()
      const now = new Date()
      return repository.create({
        kind: input.leadType,
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        consentAt: now,
        createdAt: now,
        ...(input.phone ? { phone: input.phone } : {}),
        ...(input.modelSlug ? { modelSlug: input.modelSlug } : {}),
        ...(input.dealerId ? { dealerId: input.dealerId } : {}),
        ...(input.requestedDate ? { requestedDate: input.requestedDate } : {}),
        ...(user ? { userId: user.id } : {}),
      })
    },
  }
}

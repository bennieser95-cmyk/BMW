export type LeadKind = 'contact' | 'test-drive'

export interface CreateLead {
  kind: LeadKind
  firstName: string
  lastName: string
  email: string
  phone?: string
  modelSlug?: string
  dealerId?: string
  requestedDate?: string
  userId?: string
  consentAt: Date
  createdAt: Date
}

export interface LeadSubmission {
  id: string
  createdAt: Date
}

export interface LeadRepositoryPort {
  create(input: CreateLead): Promise<LeadSubmission>
  purgeExpired(before: Date): Promise<number>
}

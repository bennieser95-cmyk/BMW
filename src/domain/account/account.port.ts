import type { CreateLead } from '../lead/lead.port'
import type { SavedConfiguration } from '../saved-configuration/saved-configuration.port'

export interface AccountExport {
  exportedAt: string
  configurations: readonly SavedConfiguration[]
  leads: readonly (CreateLead & { id: string })[]
}

export interface AccountRepositoryPort {
  exportData(userId: string): Promise<AccountExport>
  deleteData(userId: string): Promise<void>
  completeDeletion(userId: string): Promise<void>
  assertActive(userId: string): Promise<void>
}

export interface AccountIdentityPort {
  deleteCurrentUser(password?: string): Promise<void>
}

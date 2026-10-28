import 'server-only'

import { neonAccountIdentity, neonAuthAdapter } from '@/infrastructure/auth/neon-auth.adapter'
import { mockCmsAdapter } from '@/infrastructure/cms/mock-cms.adapter'
import { accountRepository } from '@/infrastructure/db/account.repository'
import { leadRepository } from '@/infrastructure/db/lead.repository'
import { savedConfigurationRepository } from '@/infrastructure/db/saved-configuration.repository'
import { securityRepository } from '@/infrastructure/db/security.repository'

import { createAccountService } from './account.service'
import { createCatalogService } from './catalog.service'
import { createLeadService } from './lead.service'

export const catalog = createCatalogService(mockCmsAdapter)
export const accounts = createAccountService(neonAuthAdapter, accountRepository, savedConfigurationRepository, neonAccountIdentity, catalog)
export const leads = createLeadService(neonAuthAdapter, mockCmsAdapter, leadRepository)
export const cms = mockCmsAdapter
export const security = securityRepository
export const leadStore = leadRepository
export { checkDatabase } from '@/infrastructure/db/health'

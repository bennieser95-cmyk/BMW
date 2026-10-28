import 'server-only'

import type { Dealer } from '@/domain/dealer/dealer.types'
import { mockCmsAdapter } from '@/infrastructure/cms/mock-cms.adapter'

export type { Dealer } from '@/domain/dealer/dealer.types'

export async function findDealers(search: string): Promise<Dealer[]> {
  const normalized = search.trim().toLocaleLowerCase('de-DE')
  return (await mockCmsAdapter.findDealers()).filter((dealer) =>
    !normalized || dealer.city.toLocaleLowerCase('de-DE').includes(normalized) ||
    dealer.postalCode.startsWith(normalized),
  )
}

import type { ConfigOption } from '../configurator/configurator.types'
import type { Dealer } from '../dealer/dealer.types'
import type { Vehicle } from '../vehicle/vehicle.types'

export interface CmsPort {
  findModels(): Promise<readonly Vehicle[]>
  findModelBySlug(slug: string): Promise<Vehicle | null>
  findOptionsByModelSlug(slug: string): Promise<readonly ConfigOption[] | null>
  findDealers(): Promise<readonly Dealer[]>
}

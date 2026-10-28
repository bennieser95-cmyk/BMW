import { CONFIGURATOR_OPTIONS } from '@/domain/configurator/configurator.options'
import type { Vehicle } from '@/domain/vehicle/vehicle.types'

import type { CmsModel } from './cms.schema'

export function mapCmsModelToModel(model: CmsModel): Vehicle {
  return {
    ...model,
    id: `mdl_${model.slug}`,
    consumption: model.fuelType === 'electric' ? '17,2 kWh/100 km' : '6,4 l/100 km',
    heroImage: {
      url: 'linear-gradient(135deg, #293848, #8396a4)',
      alt: `${model.name} - synthetic illustration`,
      width: 1200,
      height: 675,
    },
    highlights: ['Progressive Linienführung', 'Intuitives Cockpit', 'Komfort für jede Strecke'],
    variants: CONFIGURATOR_OPTIONS.filter((option) => option.category === 'engine').map(
      (option) => ({
        id: `${model.slug}-${option.id}`,
        engineCode: option.id,
        powerKw: model.powerKw,
        fuelType: model.fuelType,
        optionIds: CONFIGURATOR_OPTIONS.map(({ id }) => id),
      }),
    ),
  }
}

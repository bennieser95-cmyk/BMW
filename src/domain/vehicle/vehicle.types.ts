export const FuelType = {
  Petrol: 'petrol',
  Diesel: 'diesel',
  Hybrid: 'hybrid',
  Electric: 'electric',
} as const

export type FuelType = (typeof FuelType)[keyof typeof FuelType]
export type BodyType = 'sedan' | 'touring' | 'suv' | 'coupe'

export interface Vehicle {
  id: string
  slug: string
  name: string
  bodyType: BodyType
  fuelType: FuelType
  basePriceCents: number
  powerKw: number
  rangeKm: number
  consumption: string
  heroImage: { url: string; alt: string; width: number; height: number }
  highlights: string[]
  variants?: {
    id: string
    engineCode: string
    powerKw: number
    fuelType: FuelType
    optionIds: string[]
  }[]
}

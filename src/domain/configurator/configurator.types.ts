export type { Result } from '../shared/result.types'

export interface ConfigOption {
  id: string
  category: 'engine' | 'paint' | 'wheels' | 'interior' | 'package'
  priceDeltaCents: number
  requires?: string[]
  excludes?: string[]
}

export interface Configuration {
  modelSlug: string
  basePriceCents: number
  selections: ConfigOption[]
}

export interface RuleViolation {
  code: 'REQUIRES' | 'EXCLUDES' | 'DUPLICATE_CATEGORY' | 'INVALID_OPTION'
  optionId: string
  relatedOptionId?: string
}

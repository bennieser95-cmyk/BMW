import type { ConfigOption, Configuration, Result, RuleViolation } from './configurator.types'

export function applySelection(
  config: Configuration,
  option: ConfigOption,
): Result<Configuration, RuleViolation> {
  if (!option.id || !Number.isSafeInteger(option.priceDeltaCents)) {
    return { ok: false, error: { code: 'INVALID_OPTION', optionId: option.id } }
  }
  const selectedIds = new Set(config.selections.map(({ id }) => id))
  const missingRequirement = option.requires?.find((id) => !selectedIds.has(id))
  if (missingRequirement) {
    return {
      ok: false,
      error: { code: 'REQUIRES', optionId: option.id, relatedOptionId: missingRequirement },
    }
  }
  const excluded =
    option.excludes?.find((id) => selectedIds.has(id)) ??
    config.selections.find(({ excludes }) => excludes?.includes(option.id))?.id
  if (excluded) {
    return { ok: false, error: { code: 'EXCLUDES', optionId: option.id, relatedOptionId: excluded } }
  }
  const categorySelection = config.selections.find(({ category }) => category === option.category)
  if (categorySelection && categorySelection.id !== option.id) {
    return {
      ok: false,
      error: {
        code: 'DUPLICATE_CATEGORY',
        optionId: option.id,
        relatedOptionId: categorySelection.id,
      },
    }
  }
  const replaced = config.selections.filter(({ category }) => category !== option.category)
  const selections = [...replaced, option]
  for (const selection of selections) {
    const requirement = selection.requires?.find((id) => !selections.some((candidate) => candidate.id === id))
    if (requirement) {
      return {
        ok: false,
        error: { code: 'REQUIRES', optionId: selection.id, relatedOptionId: requirement },
      }
    }
  }
  return { ok: true, value: { ...config, selections } }
}

export function calculateTotalPrice(config: Configuration): number {
  return config.basePriceCents + config.selections.reduce((total, option) => total + option.priceDeltaCents, 0)
}

export function buildConfigurationCode(config: Configuration): string {
  const ids = config.selections.map(({ id }) => id).sort()
  return `v1.${encodeURIComponent(config.modelSlug)}.${ids.map(encodeURIComponent).join(',')}`
}

export function parseConfigurationCode(
  code: string,
  options: readonly ConfigOption[],
  basePriceCents: number,
): Result<Configuration, RuleViolation> {
  const [version, modelSlug, encodedIds, extra] = code.split('.')
  if (version !== 'v1' || !modelSlug || extra !== undefined) {
    return { ok: false, error: { code: 'INVALID_OPTION', optionId: code } }
  }
  try {
    const slug = decodeURIComponent(modelSlug)
    const ids = encodedIds ? encodedIds.split(',').map(decodeURIComponent) : []
    let config: Configuration = { modelSlug: slug, basePriceCents, selections: [] }
    for (const id of ids) {
      const option = options.find((candidate) => candidate.id === id)
      if (!option) return { ok: false, error: { code: 'INVALID_OPTION', optionId: id } }
      const result = applySelection(config, option)
      if (!result.ok) return result
      config = result.value
    }
    return { ok: true, value: config }
  } catch {
    return { ok: false, error: { code: 'INVALID_OPTION', optionId: code } }
  }
}

import { ColumnDefinition, FieldRegistryResponse, SavedView } from '@real/providers/contracts'

export type ParsedAdminListQuery = {
  limit: number
  cursor?: string
  search?: string
  filters?: Record<string, unknown>
  sort?: { key: string; direction: 'asc' | 'desc' }
  fields?: string[]
  viewId?: string
}

function parseFields(value: string | null) {
  if (!value) return undefined
  const fields = value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
  return fields.length > 0 ? fields : undefined
}

function parseFilters(value: string | null) {
  if (!value) return undefined
  try {
    const parsed = JSON.parse(value)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return undefined
    return parsed as Record<string, unknown>
  } catch {
    return undefined
  }
}

export function parseAdminListQuery(request: Request): ParsedAdminListQuery {
  const url = new URL(request.url)
  const limitRaw = Number.parseInt(url.searchParams.get('limit') ?? '25', 10)
  const limit = Math.max(1, Math.min(Number.isFinite(limitRaw) ? limitRaw : 25, 100))
  const sortKey = url.searchParams.get('sortKey')?.trim()
  const sortDir = url.searchParams.get('sortDir') === 'asc' ? 'asc' : 'desc'

  return {
    limit,
    cursor: url.searchParams.get('cursor') ?? undefined,
    search: url.searchParams.get('search')?.trim() || undefined,
    fields: parseFields(url.searchParams.get('fields')),
    filters: parseFilters(url.searchParams.get('filters')),
    sort: sortKey ? { key: sortKey, direction: sortDir } : undefined,
    viewId: url.searchParams.get('viewId')?.trim() || undefined,
  }
}

export function fieldRegistryKeys(registry: FieldRegistryResponse) {
  return new Set(
    [...registry.coreFields, ...registry.computedFields, ...registry.customFields].map((field) => field.key)
  )
}

export function mergeWithSavedView(input: ParsedAdminListQuery, savedView?: SavedView): ParsedAdminListQuery {
  if (!savedView) return input
  return {
    ...input,
    filters: input.filters ?? savedView.filters,
    sort: input.sort ?? savedView.sort,
    fields: input.fields ?? savedView.visibleColumns,
  }
}

export function validateRequestedFields(
  requested: string[] | undefined,
  registry: FieldRegistryResponse,
  fallback: string[]
): { ok: true; fields: string[] } | { ok: false; code: string; message: string } {
  const keys = fieldRegistryKeys(registry)
  const fields = requested && requested.length > 0 ? requested : fallback
  const invalid = fields.filter((field) => !keys.has(field))
  if (invalid.length > 0) {
    return {
      ok: false,
      code: 'ADMIN_FIELDS_INVALID',
      message: `Unsupported fields requested: ${invalid.join(', ')}`,
    }
  }
  return { ok: true, fields }
}

export function defaultCoreFieldKeys(registry: FieldRegistryResponse): string[] {
  return registry.coreFields.map((field: ColumnDefinition) => field.key)
}

export function validateSortKey(
  sort: ParsedAdminListQuery['sort'],
  registry: FieldRegistryResponse
): { ok: true } | { ok: false; code: string; message: string } {
  if (!sort?.key) return { ok: true }
  const sortableKeys = new Set(
    [...registry.coreFields, ...registry.computedFields, ...registry.customFields]
      .filter((field) => field.sortable)
      .map((field) => field.key)
  )
  if (!sortableKeys.has(sort.key)) {
    return {
      ok: false,
      code: 'ADMIN_SORT_INVALID',
      message: `Unsupported sort key requested: ${sort.key}`,
    }
  }
  return { ok: true }
}

export function validateFilters(
  filters: Record<string, unknown> | undefined,
  allowedKeys: readonly string[]
): { ok: true } | { ok: false; code: string; message: string } {
  if (!filters) return { ok: true }
  const invalid = Object.keys(filters).filter((key) => !allowedKeys.includes(key))
  if (invalid.length > 0) {
    return {
      ok: false,
      code: 'ADMIN_FILTERS_INVALID',
      message: `Unsupported filters requested: ${invalid.join(', ')}`,
    }
  }
  return { ok: true }
}

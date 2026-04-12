import { AdminListInput, PagedResponse } from '@real/providers/contracts'

export function encodeCursor(index: number) {
  return Buffer.from(String(index), 'utf8').toString('base64url')
}

export function decodeCursor(cursor?: string) {
  if (!cursor) return 0
  try {
    const decoded = Buffer.from(cursor, 'base64url').toString('utf8')
    const parsed = Number.parseInt(decoded, 10)
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0
  } catch {
    return 0
  }
}

export function paginate<T>(rows: T[], input: AdminListInput): PagedResponse<T> {
  const limit = Math.max(1, Math.min(input.limit || 25, 100))
  const start = decodeCursor(input.cursor)
  const nodes = rows.slice(start, start + limit)
  const end = start + nodes.length

  return {
    nodes,
    pageInfo: {
      hasNextPage: end < rows.length,
      hasPreviousPage: start > 0,
      startCursor: nodes.length > 0 ? encodeCursor(start) : undefined,
      endCursor: nodes.length > 0 ? encodeCursor(end) : undefined,
    },
  }
}

function pickCustomField(customFields: Record<string, unknown> | undefined, key: string) {
  if (!customFields) return undefined
  return customFields[key]
}

export function projectRow<T extends { customFields?: Record<string, unknown> }>(
  row: T,
  requestedFields?: string[]
): T {
  if (!requestedFields || requestedFields.length === 0) return row
  const unique = Array.from(new Set(requestedFields))
  const projected: Record<string, unknown> = { id: (row as Record<string, unknown>).id }

  for (const field of unique) {
    if (field.startsWith('custom.')) {
      const customKey = field.slice('custom.'.length)
      if (!customKey) continue
      const current = (projected.customFields as Record<string, unknown> | undefined) ?? {}
      current[customKey] = pickCustomField(row.customFields, customKey)
      projected.customFields = current
      continue
    }
    projected[field] = (row as Record<string, unknown>)[field]
  }

  return projected as T
}

export function sortRows<T extends Record<string, unknown>>(
  rows: T[],
  sort?: { key: string; direction: 'asc' | 'desc' }
) {
  if (!sort?.key) return rows
  const direction = sort.direction === 'asc' ? 1 : -1
  const key = sort.key
  const isCustom = key.startsWith('custom.')
  const customKey = isCustom ? key.slice('custom.'.length) : ''

  return [...rows].sort((a, b) => {
    const aRaw = isCustom
      ? ((a.customFields as Record<string, unknown> | undefined)?.[customKey] as unknown)
      : a[key]
    const bRaw = isCustom
      ? ((b.customFields as Record<string, unknown> | undefined)?.[customKey] as unknown)
      : b[key]
    if (aRaw === bRaw) return 0
    if (aRaw === undefined || aRaw === null) return 1
    if (bRaw === undefined || bRaw === null) return -1
    if (typeof aRaw === 'number' && typeof bRaw === 'number') return (aRaw - bRaw) * direction
    return String(aRaw).localeCompare(String(bRaw)) * direction
  })
}

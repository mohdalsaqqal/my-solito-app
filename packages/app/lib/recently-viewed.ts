const KEY = 'recently_viewed_products'
const LIMIT = 12

let memoryIds: string[] = []

function readRaw(): string[] {
  const storage = (globalThis as { localStorage?: { getItem: (key: string) => string | null } }).localStorage
  if (!storage) {
    return memoryIds
  }
  try {
    const raw = storage.getItem(KEY)
    if (!raw) {
      return []
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : []
  } catch {
    return []
  }
}

function writeRaw(ids: string[]) {
  memoryIds = ids
  const storage = (globalThis as { localStorage?: { setItem: (key: string, value: string) => void } }).localStorage
  if (!storage) {
    return
  }
  try {
    storage.setItem(KEY, JSON.stringify(ids))
  } catch {
    // Keep in-memory fallback only.
  }
}

export function readRecentlyViewedProductIds() {
  return readRaw()
}

export function pushRecentlyViewedProductId(id: string) {
  const normalized = id.trim()
  if (!normalized) {
    return
  }
  const current = readRaw()
  const next = [normalized, ...current.filter((item) => item !== normalized)].slice(0, LIMIT)
  writeRaw(next)
}

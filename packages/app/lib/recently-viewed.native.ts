const KEY = 'recently_viewed_products'
const LIMIT = 12

let memoryIds: string[] = []
let initialized = false

async function loadAsyncStorage() {
  try {
    const req = (0, eval)('require') as (id: string) => { default: { getItem: (k: string) => Promise<string | null>; setItem: (k: string, v: string) => Promise<void> } }
    return req('@react-native-async-storage/async-storage').default
  } catch {
    return null
  }
}

async function readRaw(): Promise<string[]> {
  if (!initialized) {
    const storage = await loadAsyncStorage()
    if (storage) {
      try {
        const raw = await storage.getItem(KEY)
        if (raw) {
          const parsed = JSON.parse(raw)
          memoryIds = Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : []
        }
      } catch {
        memoryIds = []
      }
    }
    initialized = true
  }
  return memoryIds
}

async function writeRaw(ids: string[]) {
  memoryIds = ids
  const storage = await loadAsyncStorage()
  if (!storage) return
  try {
    await storage.setItem(KEY, JSON.stringify(ids))
  } catch {
    // keep in-memory fallback
  }
}

export async function readRecentlyViewedProductIds() {
  return readRaw()
}

export async function pushRecentlyViewedProductId(id: string) {
  const normalized = id.trim()
  if (!normalized) return
  const current = await readRaw()
  const next = [normalized, ...current.filter((item) => item !== normalized)].slice(0, LIMIT)
  await writeRaw(next)
}

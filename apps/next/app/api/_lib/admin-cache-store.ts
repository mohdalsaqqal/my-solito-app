import fs from 'node:fs/promises'
import path from 'node:path'

type AdminCacheSettings = {
  enabled: boolean
  updatedAt: string
  updatedBy: string
}

const STORAGE_DIR = path.join(process.cwd(), '.data')
const STORAGE_FILE = path.join(STORAGE_DIR, 'admin-cache.json')

function initialState(): AdminCacheSettings {
  return {
    enabled: true,
    updatedAt: new Date().toISOString(),
    updatedBy: 'system',
  }
}

export async function readCacheSettings(): Promise<AdminCacheSettings> {
  try {
    const raw = await fs.readFile(STORAGE_FILE, 'utf8')
    const parsed = JSON.parse(raw) as Partial<AdminCacheSettings>
    return {
      enabled: parsed.enabled ?? true,
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
      updatedBy: parsed.updatedBy ?? 'system',
    }
  } catch {
    return initialState()
  }
}

export async function writeCacheSettings(
  settings: Partial<AdminCacheSettings>,
): Promise<AdminCacheSettings> {
  const current = await readCacheSettings()
  const next: AdminCacheSettings = {
    ...current,
    ...settings,
    updatedAt: new Date().toISOString(),
  }
  await fs.mkdir(STORAGE_DIR, { recursive: true })
  await fs.writeFile(STORAGE_FILE, JSON.stringify(next, null, 2), 'utf8')
  return next
}

import fs from 'node:fs/promises'
import path from 'node:path'
import { SavedView, SavedViewEntity } from '@real/providers/contracts'

type SavedViewsState = {
  views: SavedView[]
}

const STORAGE_DIR = path.join(process.cwd(), '.data')
const STORAGE_FILE = path.join(STORAGE_DIR, 'admin-saved-views.json')
const MAX_VIEWS = 200

function initialState(): SavedViewsState {
  return { views: [] }
}

function isSavedViewEntity(value: unknown): value is SavedViewEntity {
  return value === 'products' || value === 'orders' || value === 'inventory' || value === 'vendors'
}

function sanitizeSavedView(input: unknown): SavedView | null {
  if (!input || typeof input !== 'object') return null
  const row = input as Record<string, unknown>
  if (typeof row.id !== 'string' || typeof row.name !== 'string') return null
  if (!isSavedViewEntity(row.entity)) return null
  if (!Array.isArray(row.visibleColumns) || row.visibleColumns.some((item) => typeof item !== 'string')) return null

  return {
    id: row.id,
    entity: row.entity,
    name: row.name,
    filters: row.filters && typeof row.filters === 'object' ? (row.filters as Record<string, unknown>) : undefined,
    sort:
      row.sort && typeof row.sort === 'object'
        ? {
            key: String((row.sort as Record<string, unknown>).key ?? ''),
            direction:
              (row.sort as Record<string, unknown>).direction === 'asc' ? 'asc' : 'desc',
          }
        : undefined,
    visibleColumns: row.visibleColumns as string[],
  }
}

export async function readAdminSavedViewsState(): Promise<SavedViewsState> {
  try {
    const raw = await fs.readFile(STORAGE_FILE, 'utf8')
    const parsed = JSON.parse(raw) as Partial<SavedViewsState>
    const views = Array.isArray(parsed.views)
      ? parsed.views.map((entry) => sanitizeSavedView(entry)).filter(Boolean) as SavedView[]
      : []
    return { views }
  } catch {
    return initialState()
  }
}

export async function writeAdminSavedViewsState(state: SavedViewsState) {
  await fs.mkdir(STORAGE_DIR, { recursive: true })
  await fs.writeFile(
    STORAGE_FILE,
    JSON.stringify({ views: state.views.slice(0, MAX_VIEWS) }, null, 2),
    'utf8'
  )
}

export function upsertSavedView(state: SavedViewsState, view: SavedView) {
  const next = state.views.filter((entry) => entry.id !== view.id)
  state.views = [view, ...next].slice(0, MAX_VIEWS)
}

export function deleteSavedView(state: SavedViewsState, id: string) {
  const before = state.views.length
  state.views = state.views.filter((entry) => entry.id !== id)
  return before !== state.views.length
}

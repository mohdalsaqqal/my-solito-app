import fs from 'node:fs/promises'
import path from 'node:path'

type ColumnMode = 'custom' | 'source'

export type AdminCatalogColumn = {
  id: string
  label: string
  path: string
  mode: ColumnMode
}

type AdminCatalogColumnsState = {
  productColumns: AdminCatalogColumn[]
}

const STORAGE_DIR = path.join(process.cwd(), '.data')
const STORAGE_FILE = path.join(STORAGE_DIR, 'admin-catalog-columns.json')

function initialState(): AdminCatalogColumnsState {
  return {
    productColumns: [],
  }
}

export function sanitizeColumns(input: unknown): AdminCatalogColumn[] {
  if (!Array.isArray(input)) return []

  return input
    .filter((value): value is AdminCatalogColumn => {
      if (!value || typeof value !== 'object') return false
      const row = value as Record<string, unknown>
      return (
        typeof row.id === 'string' &&
        typeof row.label === 'string' &&
        typeof row.path === 'string' &&
        (row.mode === 'custom' || row.mode === 'source')
      )
    })
    .map((column) => ({
      id: column.id.trim(),
      label: column.label.trim(),
      path: column.path.trim(),
      mode: column.mode,
    }))
    .filter((column) => column.id && column.label && column.path)
}

export async function readAdminCatalogColumnsState(): Promise<AdminCatalogColumnsState> {
  try {
    const raw = await fs.readFile(STORAGE_FILE, 'utf8')
    const parsed = JSON.parse(raw) as Partial<AdminCatalogColumnsState>
    return {
      productColumns: sanitizeColumns(parsed.productColumns ?? []),
    }
  } catch {
    return initialState()
  }
}

export async function writeAdminCatalogColumnsState(state: AdminCatalogColumnsState) {
  await fs.mkdir(STORAGE_DIR, { recursive: true })
  await fs.writeFile(
    STORAGE_FILE,
    JSON.stringify(
      {
        productColumns: sanitizeColumns(state.productColumns),
      },
      null,
      2
    ),
    'utf8'
  )
}

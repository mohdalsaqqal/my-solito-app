import fs from 'node:fs/promises'
import path from 'node:path'

export type AdminCategoryRecord = {
  id: string
  nameEn: string
  nameAr: string
  slug: string
  parentId?: string
  productCount: number
  sortOrder: number
  status: 'visible' | 'hidden'
  sourceId?: string
  image?: string
  metaTitle?: string
  metaDescription?: string
  createdAt: string
  updatedAt: string
}

export type AdminBrandRecord = {
  id: string
  nameEn: string
  nameAr: string
  slug: string
  productCount: number
  status: 'visible' | 'hidden'
  sourceId?: string
  logoUrl?: string
  description?: string
  websiteUrl?: string
  createdAt: string
  updatedAt: string
}

type AdminCatalogState = {
  categories: AdminCategoryRecord[]
  brands: AdminBrandRecord[]
}

const STORAGE_DIR = path.join(process.cwd(), '.data')
const STORAGE_FILE = path.join(STORAGE_DIR, 'admin-catalog.json')

function initialState(): AdminCatalogState {
  return { categories: [], brands: [] }
}

export async function readAdminCatalogState(): Promise<AdminCatalogState> {
  try {
    const raw = await fs.readFile(STORAGE_FILE, 'utf-8')
    return JSON.parse(raw) as AdminCatalogState
  } catch {
    return initialState()
  }
}

export async function writeAdminCatalogState(state: AdminCatalogState): Promise<void> {
  await fs.mkdir(STORAGE_DIR, { recursive: true })
  await fs.writeFile(STORAGE_FILE, JSON.stringify(state, null, 2), 'utf-8')
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

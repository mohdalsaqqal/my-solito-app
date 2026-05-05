import { promises as fs } from 'node:fs'
import * as path from 'node:path'
import type {
  MenuCreateInput,
  MenuProvider,
  MenuRecord,
  MenuUpdateInput,
} from '@real/providers/contracts'

const STORAGE_DIR = process.env.VERCEL ? path.join('/tmp', 'real-commerce') : path.join(process.cwd(), '.tmp')
const STORAGE_FILE = path.join(STORAGE_DIR, 'mock-menus.json')

const now = () => new Date().toISOString()

const seedMenus: MenuRecord[] = [
  {
    id: 'menu-header-primary',
    name: 'Header Primary',
    slug: 'header-primary',
    location: 'header_primary',
    displayStyle: 'default',
    enabled: true,
    analytics: {
      impressionKey: 'menu.header_primary.impression',
      clickKey: 'menu.header_primary.click',
    },
    items: [
      {
        id: 'menu-item-new-arrivals',
        label: { en: 'New Arrivals', ar: 'وصل حديثاً' },
        ref: { sourceType: 'query', sourceId: 'home-new-arrivals' },
        order: 0,
        enabled: true,
        analytics: {
          impressionKey: 'menu.item.new_arrivals.impression',
          clickKey: 'menu.item.new_arrivals.click',
        },
      },
      {
        id: 'menu-item-flash-sales',
        label: { en: 'Flash Sales', ar: 'عروض سريعة' },
        ref: { sourceType: 'query', sourceId: 'flash-sales' },
        order: 1,
        enabled: true,
      },
    ],
    createdAt: now(),
    updatedAt: now(),
  },
]

async function readMenus(): Promise<MenuRecord[]> {
  try {
    const raw = await fs.readFile(STORAGE_FILE, 'utf8')
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed as MenuRecord[]
  } catch {
    await fs.mkdir(STORAGE_DIR, { recursive: true })
    await fs.writeFile(STORAGE_FILE, JSON.stringify(seedMenus, null, 2), 'utf8')
    return seedMenus
  }
}

async function writeMenus(menus: MenuRecord[]) {
  await fs.mkdir(STORAGE_DIR, { recursive: true })
  await fs.writeFile(STORAGE_FILE, JSON.stringify(menus, null, 2), 'utf8')
}

function mergeMenuRecord(current: MenuRecord, input: MenuUpdateInput): MenuRecord {
  return {
    ...current,
    ...input,
    id: current.id,
    createdAt: current.createdAt,
    updatedAt: now(),
  }
}

export const mockMenuAdapter: MenuProvider = {
  async list() {
    return { ok: true, data: await readMenus() }
  },
  async getById(id) {
    const menus = await readMenus()
    const found = menus.find((item) => item.id === id)
    if (!found) {
      return {
        ok: false,
        error: {
          code: 'MENU_NOT_FOUND',
          message: 'The requested menu does not exist.',
        },
      }
    }
    return { ok: true, data: found }
  },
  async create(input: MenuCreateInput) {
    const menus = await readMenus()
    if (menus.some((item) => item.id === input.id || item.slug === input.slug)) {
      return {
        ok: false,
        error: {
          code: 'MENU_EXISTS',
          message: 'Menu id or slug already exists.',
        },
      }
    }

    const created: MenuRecord = {
      ...input,
      createdAt: now(),
      updatedAt: now(),
    }
    menus.push(created)
    await writeMenus(menus)
    return { ok: true, data: created }
  },
  async update(id, input: MenuUpdateInput) {
    const menus = await readMenus()
    const index = menus.findIndex((item) => item.id === id)
    if (index < 0) {
      return {
        ok: false,
        error: {
          code: 'MENU_NOT_FOUND',
          message: 'The requested menu does not exist.',
        },
      }
    }

    const current = menus[index]
    if (!current) {
      return {
        ok: false,
        error: {
          code: 'MENU_NOT_FOUND',
          message: 'The requested menu does not exist.',
        },
      }
    }
    const nextSlug = input.slug?.trim()
    if (
      nextSlug &&
      menus.some((item, menuIndex) => menuIndex !== index && item.slug === nextSlug)
    ) {
      return {
        ok: false,
        error: {
          code: 'MENU_EXISTS',
          message: 'Menu slug already exists.',
        },
      }
    }

    const updated = mergeMenuRecord(current, input)
    menus[index] = updated
    await writeMenus(menus)
    return { ok: true, data: updated }
  },
  async delete(id) {
    const menus = await readMenus()
    const index = menus.findIndex((item) => item.id === id)
    if (index < 0) {
      return {
        ok: false,
        error: {
          code: 'MENU_NOT_FOUND',
          message: 'The requested menu does not exist.',
        },
      }
    }
    menus.splice(index, 1)
    await writeMenus(menus)
    return { ok: true, data: { id, deleted: true as const } }
  },
}

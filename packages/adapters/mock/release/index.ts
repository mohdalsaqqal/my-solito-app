import { promises as fs } from 'node:fs'
import * as path from 'node:path'
import {
  ReleaseProvider,
  ReleaseRecord,
  ReleaseBlockRecord,
  ReleaseEnvironment,
  ReleaseStatus,
  ReleaseBlockType,
} from '@real/providers/contracts'

const STORAGE_DIR = path.join(process.cwd(), '.tmp')
const STORAGE_FILE = path.join(STORAGE_DIR, 'mock-releases.json')

type ReleaseStore = {
  releases: ReleaseRecord[]
  blocks: ReleaseBlockRecord[]
}

const now = new Date().toISOString()

const seedStore: ReleaseStore = {
  releases: [
    {
      id: 'rel-prod-home-v1',
      environment: 'production',
      status: 'published',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'rel-staging-home-v1',
      environment: 'staging',
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    },
  ],
  blocks: [
    {
      id: 'blk-hero-1',
      releaseId: 'rel-prod-home-v1',
      position: 1,
      type: 'hero',
      payloadJson: {
        id: 'hero-main',
        type: 'hero',
        title: { en: 'Luxury marketplace deals', ar: 'عروض سوق فاخر' },
        subtitle: { en: 'Curated premium picks', ar: 'اختيارات فاخرة بعناية' },
        ctaLabel: { en: 'Shop now', ar: 'تسوق الآن' },
        imageUrl:
          'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1800&h=700&q=80',
      },
    },
    {
      id: 'blk-slider-1',
      releaseId: 'rel-prod-home-v1',
      position: 2,
      type: 'product_slider',
      payloadJson: {
        id: 'slider-best-items',
        type: 'product_slider',
        title: { en: 'Best Items for This Month', ar: 'أفضل المنتجات لهذا الشهر' },
        querySlug: 'home-best-items',
      },
    },
    {
      id: 'blk-strip-1',
      releaseId: 'rel-prod-home-v1',
      position: 3,
      type: 'promo_strip',
      payloadJson: {
        id: 'strip-shipping',
        type: 'promo_strip',
        text: { en: 'Free shipping over 20 JDS', ar: 'شحن مجاني فوق 20 دينار' },
        ctaLabel: { en: 'Shop now', ar: 'تسوق الآن' },
        href: '/shop',
      },
    },
  ],
}

function releaseId() {
  return `rel-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function blockId() {
  return `blk-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

async function readStore(): Promise<ReleaseStore> {
  try {
    const raw = await fs.readFile(STORAGE_FILE, 'utf8')
    const parsed = JSON.parse(raw) as Partial<ReleaseStore>
    return {
      releases: Array.isArray(parsed.releases) ? (parsed.releases as ReleaseRecord[]) : [],
      blocks: Array.isArray(parsed.blocks) ? (parsed.blocks as ReleaseBlockRecord[]) : [],
    }
  } catch {
    await fs.mkdir(STORAGE_DIR, { recursive: true })
    await fs.writeFile(STORAGE_FILE, JSON.stringify(seedStore), 'utf8')
    return seedStore
  }
}

async function writeStore(store: ReleaseStore) {
  await fs.mkdir(STORAGE_DIR, { recursive: true })
  await fs.writeFile(STORAGE_FILE, JSON.stringify(store), 'utf8')
}

export const mockReleaseAdapter: ReleaseProvider = {
  async list(environment?: ReleaseEnvironment) {
    const store = await readStore()
    const rows = environment
      ? store.releases.filter((item) => item.environment === environment)
      : store.releases
    return { ok: true, data: rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)) }
  },
  async create(input) {
    const store = await readStore()
    const nowIso = new Date().toISOString()
    const created: ReleaseRecord = {
      id: releaseId(),
      environment: input.environment,
      status: input.status ?? 'draft',
      createdAt: nowIso,
      updatedAt: nowIso,
    }
    store.releases.unshift(created)
    await writeStore(store)
    return { ok: true, data: created }
  },
  async update(id, input) {
    const store = await readStore()
    const index = store.releases.findIndex((item) => item.id === id)
    if (index < 0) {
      return { ok: false, error: { code: 'RELEASE_NOT_FOUND', message: 'Release not found.' } }
    }
    const current = store.releases[index]
    const updated: ReleaseRecord = {
      ...current,
      environment: input.environment ?? current.environment,
      status: input.status ?? current.status,
      updatedAt: new Date().toISOString(),
    }
    store.releases[index] = updated
    await writeStore(store)
    return { ok: true, data: updated }
  },
  async publish(id) {
    const store = await readStore()
    const index = store.releases.findIndex((item) => item.id === id)
    if (index < 0) {
      return { ok: false, error: { code: 'RELEASE_NOT_FOUND', message: 'Release not found.' } }
    }
    const current = store.releases[index]
    const nowIso = new Date().toISOString()
    for (let i = 0; i < store.releases.length; i += 1) {
      const release = store.releases[i]
      if (release.environment === current.environment && release.status === 'published') {
        store.releases[i] = { ...release, status: 'draft', updatedAt: nowIso }
      }
    }
    const updated: ReleaseRecord = { ...current, status: 'published', updatedAt: nowIso }
    store.releases[index] = updated
    await writeStore(store)
    return { ok: true, data: updated }
  },
  async getPublished(environment: ReleaseEnvironment) {
    const store = await readStore()
    const release = store.releases.find((item) => item.environment === environment && item.status === 'published')
    if (!release) {
      return {
        ok: false,
        error: {
          code: 'RELEASE_NOT_FOUND',
          message: 'No published release found for the requested environment.',
        },
      }
    }
    return { ok: true, data: release }
  },
  async getById(id: string) {
    const store = await readStore()
    const release = store.releases.find((item) => item.id === id)
    if (!release) {
      return {
        ok: false,
        error: {
          code: 'RELEASE_NOT_FOUND',
          message: 'Release not found.',
        },
      }
    }
    return { ok: true, data: release }
  },
  async listBlocks(releaseId: string) {
    const store = await readStore()
    const blocks = store.blocks.filter((item) => item.releaseId === releaseId)
    return { ok: true, data: [...blocks].sort((a, b) => a.position - b.position) }
  },
  async createBlock(input) {
    const store = await readStore()
    const created: ReleaseBlockRecord = {
      id: blockId(),
      releaseId: input.releaseId,
      position: input.position,
      type: input.type as ReleaseBlockType,
      payloadJson: input.payloadJson,
    }
    store.blocks.push(created)
    await writeStore(store)
    return { ok: true, data: created }
  },
  async updateBlock(id, input) {
    const store = await readStore()
    const index = store.blocks.findIndex((item) => item.id === id)
    if (index < 0) {
      return { ok: false, error: { code: 'RELEASE_BLOCK_NOT_FOUND', message: 'Release block not found.' } }
    }
    const current = store.blocks[index]
    const updated: ReleaseBlockRecord = {
      ...current,
      position: input.position ?? current.position,
      type: (input.type as ReleaseBlockType | undefined) ?? current.type,
      payloadJson: input.payloadJson ?? current.payloadJson,
    }
    store.blocks[index] = updated
    await writeStore(store)
    return { ok: true, data: updated }
  },
  async deleteBlock(id) {
    const store = await readStore()
    const exists = store.blocks.some((item) => item.id === id)
    if (!exists) {
      return { ok: false, error: { code: 'RELEASE_BLOCK_NOT_FOUND', message: 'Release block not found.' } }
    }
    store.blocks = store.blocks.filter((item) => item.id !== id)
    await writeStore(store)
    return { ok: true, data: { id, deleted: true } }
  },
}


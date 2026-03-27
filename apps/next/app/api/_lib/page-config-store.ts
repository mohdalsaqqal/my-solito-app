import fs from 'node:fs/promises'
import path from 'node:path'
import {
  HOME_PAGE_SLUG,
  HOME_PAGE_TYPE,
  PAGE_BLOCK_CONTRACT_VERSION,
  type PageBlockContractVersion,
} from '@real/app/lib/layout/page-types'
import type { ReleaseBlockRecord, ReleaseBlockType } from '@real/providers/contracts'
import { ADMIN_DATA_DIR, ensureAdminDataDir } from './admin-site-config-store'

export type PageConfigBlockRecord = {
  id: string
  releaseId: string
  position: number
  type: ReleaseBlockType
  version: PageBlockContractVersion
  payloadJson: unknown
  enabled: boolean
}

export type PageConfigRecord = {
  pageConfigId: string
  releaseId: string
  storeId: string
  slug: string
  pageType: string
  updatedAt: string
  blocks: PageConfigBlockRecord[]
}

type PageConfigStoreState = {
  pages: PageConfigRecord[]
}

type CreatePageConfigStoreOptions = {
  storageFile?: string
}

const DEFAULT_STORAGE_FILE = path.join(ADMIN_DATA_DIR, 'page-config-store.json')

export function buildPageConfigId(input: {
  storeId: string
  slug: string
  pageType: string
  releaseId: string
}) {
  const normalizedSlug = input.slug === '/' ? 'root' : input.slug.replace(/[^a-z0-9]+/gi, '-')
  return `pagecfg-${input.storeId}-${input.pageType}-${normalizedSlug}-${input.releaseId}`
}

function normalizePageConfigBlockRecord(block: PageConfigBlockRecord): PageConfigBlockRecord {
  return {
    id: block.id,
    releaseId: block.releaseId.trim(),
    position: Number.isFinite(block.position) ? block.position : 0,
    type: block.type,
    version: PAGE_BLOCK_CONTRACT_VERSION,
    payloadJson: block.payloadJson,
    enabled: block.enabled !== false,
  }
}

function normalizePageConfigRecord(record: PageConfigRecord): PageConfigRecord {
  const storeId = record.storeId.trim() || 'default'
  const slug = record.slug.trim() || HOME_PAGE_SLUG
  const pageType = record.pageType.trim() || HOME_PAGE_TYPE
  const releaseId = record.releaseId.trim()

  return {
    pageConfigId: record.pageConfigId?.trim() || buildPageConfigId({ storeId, slug, pageType, releaseId }),
    releaseId,
    storeId,
    slug,
    pageType,
    updatedAt: record.updatedAt || new Date().toISOString(),
    blocks: [...record.blocks]
      .map(normalizePageConfigBlockRecord)
      .sort((left, right) => left.position - right.position),
  }
}

function initialState(): PageConfigStoreState {
  return { pages: [] }
}

export function toPageConfigBlocks(releaseId: string, blocks: ReleaseBlockRecord[]): PageConfigBlockRecord[] {
  return [...blocks]
    .sort((left, right) => left.position - right.position)
    .map((block) => ({
      id: block.id,
      releaseId,
      position: block.position,
      type: block.type,
      version: PAGE_BLOCK_CONTRACT_VERSION,
      payloadJson: block.payloadJson,
      enabled: block.enabled !== false,
    }))
}

function createStoreInternals(storageFile: string) {
  async function readState(): Promise<PageConfigStoreState> {
    try {
      const raw = await fs.readFile(storageFile, 'utf8')
      const parsed = JSON.parse(raw) as Partial<PageConfigStoreState>
      return {
        pages: Array.isArray(parsed.pages)
          ? parsed.pages.map((page) => normalizePageConfigRecord(page as PageConfigRecord))
          : [],
      }
    } catch {
      return initialState()
    }
  }

  async function writeState(state: PageConfigStoreState) {
    await fs.mkdir(path.dirname(storageFile), { recursive: true })
    await fs.writeFile(
      storageFile,
      JSON.stringify(
        {
          pages: state.pages.map((page) => normalizePageConfigRecord(page)),
        },
        null,
        2,
      ),
      'utf8',
    )
  }

  return { readState, writeState }
}

export function createPageConfigStore(options: CreatePageConfigStoreOptions = {}) {
  const storageFile = options.storageFile ?? DEFAULT_STORAGE_FILE
  const { readState, writeState } = createStoreInternals(storageFile)

  return {
    async readPageConfigState() {
      return readState()
    },

    async writePageConfigState(state: PageConfigStoreState) {
      await writeState(state)
    },

    async upsertPageConfig(record: PageConfigRecord) {
      const normalized = normalizePageConfigRecord(record)
      const state = await readState()
      const index = state.pages.findIndex((page) => page.releaseId === normalized.releaseId)

      if (index >= 0) state.pages[index] = normalized
      else state.pages.push(normalized)

      await writeState(state)
      return normalized
    },

    async getPageConfig(storeId: string, slug: string, pageType: string = HOME_PAGE_TYPE) {
      const state = await readState()
      return (
        state.pages.find(
          (page) => page.storeId === storeId && page.slug === slug && page.pageType === pageType,
        ) ?? null
      )
    },

    async getPageConfigByReleaseId(releaseId: string) {
      const state = await readState()
      return state.pages.find((page) => page.releaseId === releaseId) ?? null
    },

    async syncReleaseBlocksToPageDraft(input: {
      storeId: string
      releaseId: string
      slug?: string
      pageType?: string
      blocks: ReleaseBlockRecord[]
    }) {
      const existing = await this.getPageConfigByReleaseId(input.releaseId)
      return this.upsertPageConfig({
        pageConfigId:
          existing?.pageConfigId ||
          buildPageConfigId({
            storeId: input.storeId,
            slug: input.slug ?? HOME_PAGE_SLUG,
            pageType: input.pageType ?? HOME_PAGE_TYPE,
            releaseId: input.releaseId,
          }),
        releaseId: input.releaseId,
        storeId: input.storeId,
        slug: input.slug ?? HOME_PAGE_SLUG,
        pageType: input.pageType ?? HOME_PAGE_TYPE,
        updatedAt: new Date().toISOString(),
        blocks: toPageConfigBlocks(input.releaseId, input.blocks),
      })
    },

    async removeBlockFromPageDraft(input: { storeId: string; slug?: string; blockId: string }) {
      const slug = input.slug ?? HOME_PAGE_SLUG
      const existing = await this.getPageConfig(input.storeId, slug)
      if (!existing) return null

      const nextBlocks = existing.blocks.filter((block) => block.id !== input.blockId)
      const updated = normalizePageConfigRecord({
        ...existing,
        updatedAt: new Date().toISOString(),
        blocks: nextBlocks,
      })
      await this.upsertPageConfig(updated)
      return updated
    },
  }
}

const defaultStore = createPageConfigStore()

export async function readPageConfigState() {
  return defaultStore.readPageConfigState()
}

export async function writePageConfigState(state: PageConfigStoreState) {
  await ensureAdminDataDir()
  return defaultStore.writePageConfigState(state)
}

export async function upsertPageConfig(record: PageConfigRecord) {
  return defaultStore.upsertPageConfig(record)
}

export async function getPageConfig(storeId: string, slug: string, pageType: string = HOME_PAGE_TYPE) {
  return defaultStore.getPageConfig(storeId, slug, pageType)
}

export async function getPageConfigByReleaseId(releaseId: string) {
  return defaultStore.getPageConfigByReleaseId(releaseId)
}

export async function syncReleaseBlocksToPageDraft(input: {
  storeId: string
  releaseId: string
  slug?: string
  pageType?: string
  blocks: ReleaseBlockRecord[]
}) {
  return defaultStore.syncReleaseBlocksToPageDraft(input)
}

export async function removeBlockFromPageDraft(input: { storeId: string; slug?: string; blockId: string }) {
  return defaultStore.removeBlockFromPageDraft(input)
}

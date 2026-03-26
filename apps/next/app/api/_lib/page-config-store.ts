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
  releaseId?: string
  position: number
  type: ReleaseBlockType
  version: PageBlockContractVersion
  payloadJson: unknown
  enabled: boolean
}

export type PageConfigRecord = {
  storeId: string
  slug: string
  pageType: string
  updatedAt: string
  blocks: PageConfigBlockRecord[]
}

type PageConfigStoreState = {
  pages: PageConfigRecord[]
}

const STORAGE_FILE = path.join(ADMIN_DATA_DIR, 'page-config-store.json')

function normalizePageConfigBlockRecord(block: PageConfigBlockRecord): PageConfigBlockRecord {
  return {
    id: block.id,
    releaseId: typeof block.releaseId === 'string' ? block.releaseId : undefined,
    position: Number.isFinite(block.position) ? block.position : 0,
    type: block.type,
    version: PAGE_BLOCK_CONTRACT_VERSION,
    payloadJson: block.payloadJson,
    enabled: block.enabled !== false,
  }
}

function normalizePageConfigRecord(record: PageConfigRecord): PageConfigRecord {
  return {
    storeId: record.storeId.trim() || 'default',
    slug: record.slug.trim() || HOME_PAGE_SLUG,
    pageType: record.pageType.trim() || HOME_PAGE_TYPE,
    updatedAt: record.updatedAt || new Date().toISOString(),
    blocks: [...record.blocks]
      .map(normalizePageConfigBlockRecord)
      .sort((left, right) => left.position - right.position),
  }
}

function initialState(): PageConfigStoreState {
  return { pages: [] }
}

export function toPageConfigBlocks(
  releaseId: string,
  blocks: ReleaseBlockRecord[],
): PageConfigBlockRecord[] {
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

export async function readPageConfigState(): Promise<PageConfigStoreState> {
  try {
    const raw = await fs.readFile(STORAGE_FILE, 'utf8')
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

export async function writePageConfigState(state: PageConfigStoreState) {
  await ensureAdminDataDir()
  await fs.writeFile(
    STORAGE_FILE,
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

export async function upsertPageConfig(record: PageConfigRecord) {
  const normalized = normalizePageConfigRecord(record)
  const state = await readPageConfigState()
  const index = state.pages.findIndex(
    (page) => page.storeId === normalized.storeId && page.slug === normalized.slug,
  )

  if (index >= 0) state.pages[index] = normalized
  else state.pages.push(normalized)

  await writePageConfigState(state)
  return normalized
}

export async function getPageConfig(storeId: string, slug: string) {
  const state = await readPageConfigState()
  return (
    state.pages.find((page) => page.storeId === storeId && page.slug === slug) ?? null
  )
}

export async function syncReleaseBlocksToPageDraft(input: {
  storeId: string
  releaseId: string
  slug?: string
  pageType?: string
  blocks: ReleaseBlockRecord[]
}) {
  return upsertPageConfig({
    storeId: input.storeId,
    slug: input.slug ?? HOME_PAGE_SLUG,
    pageType: input.pageType ?? HOME_PAGE_TYPE,
    updatedAt: new Date().toISOString(),
    blocks: toPageConfigBlocks(input.releaseId, input.blocks),
  })
}

export async function removeBlockFromPageDraft(input: {
  storeId: string
  slug?: string
  blockId: string
}) {
  const slug = input.slug ?? HOME_PAGE_SLUG
  const existing = await getPageConfig(input.storeId, slug)
  if (!existing) return null

  const nextBlocks = existing.blocks.filter((block) => block.id !== input.blockId)
  const updated = normalizePageConfigRecord({
    ...existing,
    updatedAt: new Date().toISOString(),
    blocks: nextBlocks,
  })
  await upsertPageConfig(updated)
  return updated
}

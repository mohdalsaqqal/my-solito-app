import fs from 'node:fs/promises'
import path from 'node:path'
import {
  HOME_PAGE_SLUG,
  HOME_PAGE_TYPE,
  type PageBlockContractVersion,
} from '@real/app/lib/layout/page-types'
import type { ReleaseBlockRecord, ReleaseBlockType } from '@real/providers/contracts'
import { ADMIN_DATA_DIR, ensureAdminDataDir } from './admin-site-config-store'
import { toPageConfigBlocks, type PageConfigBlockRecord } from './page-config-store'

export type PageVersionSource = 'preview' | 'publish'

export type PageVersionRecord = {
  id: string
  releaseId: string
  storeId: string
  slug: string
  pageType: string
  createdAt: string
  source: PageVersionSource
  blocks: PageConfigBlockRecord[]
}

type PageVersionStoreState = {
  versions: PageVersionRecord[]
}

const STORAGE_FILE = path.join(ADMIN_DATA_DIR, 'page-version-store.json')

function pageVersionId() {
  return `pgv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function normalizeVersionBlockRecord(block: PageConfigBlockRecord): PageConfigBlockRecord {
  return {
    id: block.id,
    releaseId: typeof block.releaseId === 'string' ? block.releaseId : undefined,
    position: Number.isFinite(block.position) ? block.position : 0,
    type: block.type as ReleaseBlockType,
    version: block.version as PageBlockContractVersion,
    payloadJson: block.payloadJson,
    enabled: block.enabled !== false,
  }
}

function normalizePageVersionRecord(record: PageVersionRecord): PageVersionRecord {
  return {
    id: record.id,
    releaseId: record.releaseId,
    storeId: record.storeId.trim() || 'default',
    slug: record.slug.trim() || HOME_PAGE_SLUG,
    pageType: record.pageType.trim() || HOME_PAGE_TYPE,
    createdAt: record.createdAt || new Date().toISOString(),
    source: record.source === 'publish' ? 'publish' : 'preview',
    blocks: [...record.blocks]
      .map(normalizeVersionBlockRecord)
      .sort((left, right) => left.position - right.position),
  }
}

function initialState(): PageVersionStoreState {
  return { versions: [] }
}

export async function readPageVersionState(): Promise<PageVersionStoreState> {
  try {
    const raw = await fs.readFile(STORAGE_FILE, 'utf8')
    const parsed = JSON.parse(raw) as Partial<PageVersionStoreState>
    return {
      versions: Array.isArray(parsed.versions)
        ? parsed.versions.map((version) => normalizePageVersionRecord(version as PageVersionRecord))
        : [],
    }
  } catch {
    return initialState()
  }
}

export async function writePageVersionState(state: PageVersionStoreState) {
  await ensureAdminDataDir()
  await fs.writeFile(
    STORAGE_FILE,
    JSON.stringify(
      {
        versions: state.versions.map((version) => normalizePageVersionRecord(version)),
      },
      null,
      2,
    ),
    'utf8',
  )
}

export async function createPageVersionSnapshot(input: {
  releaseId: string
  storeId: string
  slug?: string
  pageType?: string
  source: PageVersionSource
  blocks: ReleaseBlockRecord[]
}) {
  const snapshot = normalizePageVersionRecord({
    id: pageVersionId(),
    releaseId: input.releaseId,
    storeId: input.storeId,
    slug: input.slug ?? HOME_PAGE_SLUG,
    pageType: input.pageType ?? HOME_PAGE_TYPE,
    createdAt: new Date().toISOString(),
    source: input.source,
    blocks: toPageConfigBlocks(input.releaseId, input.blocks),
  })

  const state = await readPageVersionState()
  state.versions.unshift(snapshot)
  await writePageVersionState(state)
  return snapshot
}

export async function getPageVersionById(id: string) {
  const state = await readPageVersionState()
  return state.versions.find((version) => version.id === id) ?? null
}

export async function findLatestPageVersionByRelease(input: {
  releaseId: string
  storeId: string
  slug?: string
}) {
  const slug = input.slug ?? HOME_PAGE_SLUG
  const state = await readPageVersionState()
  return (
    state.versions.find(
      (version) =>
        version.releaseId === input.releaseId &&
        version.storeId === input.storeId &&
        version.slug === slug,
    ) ?? null
  )
}

export function toReleaseBlockRecords(version: PageVersionRecord): ReleaseBlockRecord[] {
  return version.blocks.map((block) => ({
    id: block.id,
    releaseId: block.releaseId ?? version.releaseId,
    position: block.position,
    type: block.type,
    payloadJson: block.payloadJson,
    enabled: block.enabled,
  }))
}

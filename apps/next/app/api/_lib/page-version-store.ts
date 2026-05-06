import fs from 'node:fs/promises'
import path from 'node:path'
import {
  HOME_PAGE_SLUG,
  HOME_PAGE_TYPE,
  type PageBlockContractVersion,
} from '@real/app/lib/layout/page-types'
import type { ReleaseBlockRecord, ReleaseBlockType } from '@real/providers/contracts'
import { prisma } from '../../../server/lib/prisma'
import { ADMIN_DATA_DIR, ensureAdminDataDir } from './admin-site-config-store'
import { isReleaseLikeEnvironment } from './security-policy'
import { toPageConfigBlocks, type PageConfigBlockRecord } from './page-config-store'

export type PageVersionSource = 'preview' | 'publish'

export type PageVersionRecord = {
  id: string
  versionId: string
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

type SnapshotInput = {
  versionId?: string
  releaseId: string
  storeId: string
  slug?: string
  pageType?: string
  source?: PageVersionSource
  blocks: Array<{
    id: string
    position: number
    type: ReleaseBlockType
    payloadJson: unknown
    enabled?: boolean
  }>
}

type CreatePageVersionStoreOptions = {
  storageFile?: string
}

const DEFAULT_STORAGE_FILE = path.join(ADMIN_DATA_DIR, 'page-version-store.json')
const TENANT_ID = 'default'

type DbPageVersionRow = {
  id: string
  versionId: string
  releaseId: string
  storeId: string
  slug: string
  pageType: string
  source: string
  blocksJson: unknown
  createdAt: Date
}

function pageVersionId() {
  return `pgv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function normalizeVersionBlockRecord(block: PageConfigBlockRecord): PageConfigBlockRecord {
  return {
    id: block.id,
    releaseId: block.releaseId,
    position: Number.isFinite(block.position) ? block.position : 0,
    type: block.type as ReleaseBlockType,
    version: block.version as PageBlockContractVersion,
    payloadJson: block.payloadJson,
    enabled: block.enabled !== false,
  }
}

function normalizePageVersionRecord(record: PageVersionRecord): PageVersionRecord {
  const versionId = record.versionId?.trim() || record.id?.trim() || pageVersionId()
  return {
    id: record.id?.trim() || versionId,
    versionId,
    releaseId: record.releaseId.trim(),
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

function serializeJson(value: unknown) {
  return JSON.parse(JSON.stringify(value)) as unknown
}

function rowToPageVersionRecord(row: DbPageVersionRow): PageVersionRecord {
  return normalizePageVersionRecord({
    id: row.id,
    versionId: row.versionId,
    releaseId: row.releaseId,
    storeId: row.storeId,
    slug: row.slug,
    pageType: row.pageType,
    createdAt: row.createdAt.toISOString(),
    source: row.source === 'publish' ? 'publish' : 'preview',
    blocks: Array.isArray(row.blocksJson) ? (row.blocksJson as PageConfigBlockRecord[]) : [],
  })
}

function createStoreInternals(storageFile: string) {
  async function readState(): Promise<PageVersionStoreState> {
    try {
      const raw = await fs.readFile(storageFile, 'utf8')
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

  async function writeState(state: PageVersionStoreState) {
    await fs.mkdir(path.dirname(storageFile), { recursive: true })
    await fs.writeFile(
      storageFile,
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

  return { readState, writeState }
}

export function createPageVersionStore(options: CreatePageVersionStoreOptions = {}) {
  const storageFile = options.storageFile ?? DEFAULT_STORAGE_FILE
  const { readState, writeState } = createStoreInternals(storageFile)
  const useFileStore = Boolean(options.storageFile)

  async function readDbState(): Promise<PageVersionStoreState> {
    try {
      const versions = await (prisma as any).cmsPageVersion.findMany({
        where: { tenantId: TENANT_ID },
        orderBy: { createdAt: 'desc' },
      })
      return { versions: versions.map(rowToPageVersionRecord) }
    } catch (cause) {
      if (isReleaseLikeEnvironment()) throw cause
      return readState()
    }
  }

  async function writeDbState(state: PageVersionStoreState) {
    try {
      await prisma.$transaction(async (tx: any) => {
        await tx.cmsPageVersion.deleteMany({ where: { tenantId: TENANT_ID } })
        for (const version of state.versions.map((record) => normalizePageVersionRecord(record))) {
          await tx.cmsPageVersion.create({
            data: {
              id: version.id,
              tenantId: TENANT_ID,
              versionId: version.versionId,
              releaseId: version.releaseId,
              storeId: version.storeId,
              slug: version.slug,
              pageType: version.pageType,
              source: version.source,
              blocksJson: serializeJson(version.blocks),
              createdAt: new Date(version.createdAt),
            },
          })
        }
      })
    } catch (cause) {
      if (isReleaseLikeEnvironment()) throw cause
      await writeState(state)
    }
  }

  async function snapshotDbPageVersion(snapshot: PageVersionRecord) {
    try {
      const row = await (prisma as any).cmsPageVersion.create({
        data: {
          id: snapshot.id,
          tenantId: TENANT_ID,
          versionId: snapshot.versionId,
          releaseId: snapshot.releaseId,
          storeId: snapshot.storeId,
          slug: snapshot.slug,
          pageType: snapshot.pageType,
          source: snapshot.source,
          blocksJson: serializeJson(snapshot.blocks),
          createdAt: new Date(snapshot.createdAt),
        },
      })
      return rowToPageVersionRecord(row)
    } catch (cause) {
      if (isReleaseLikeEnvironment()) throw cause
      const state = await readState()
      state.versions.unshift(snapshot)
      await writeState(state)
      return snapshot
    }
  }

  async function getDbPageVersionById(id: string) {
    try {
      const version = await (prisma as any).cmsPageVersion.findFirst({
        where: { tenantId: TENANT_ID, OR: [{ id }, { versionId: id }] },
      })
      return version ? rowToPageVersionRecord(version) : null
    } catch (cause) {
      if (isReleaseLikeEnvironment()) throw cause
      const state = await readState()
      return state.versions.find((version) => version.id === id || version.versionId === id) ?? null
    }
  }

  async function getDbPageVersionByReleaseId(releaseId: string) {
    try {
      const version = await (prisma as any).cmsPageVersion.findFirst({
        where: { tenantId: TENANT_ID, releaseId },
        orderBy: { createdAt: 'desc' },
      })
      return version ? rowToPageVersionRecord(version) : null
    } catch (cause) {
      if (isReleaseLikeEnvironment()) throw cause
      const state = await readState()
      return state.versions.find((version) => version.releaseId === releaseId) ?? null
    }
  }

  async function findLatestDbPageVersionByRelease(input: { releaseId: string; storeId: string; slug?: string }) {
    const slug = input.slug ?? HOME_PAGE_SLUG
    try {
      const version = await (prisma as any).cmsPageVersion.findFirst({
        where: { tenantId: TENANT_ID, releaseId: input.releaseId, storeId: input.storeId, slug },
        orderBy: { createdAt: 'desc' },
      })
      return version ? rowToPageVersionRecord(version) : null
    } catch (cause) {
      if (isReleaseLikeEnvironment()) throw cause
      const state = await readState()
      return (
        state.versions.find(
          (version) =>
            version.releaseId === input.releaseId &&
            version.storeId === input.storeId &&
            version.slug === slug,
        ) ?? null
      )
    }
  }

  return {
    async readPageVersionState() {
      return useFileStore ? readState() : readDbState()
    },

    async writePageVersionState(state: PageVersionStoreState) {
      if (useFileStore) await writeState(state)
      else await writeDbState(state)
    },

    async snapshotPageVersion(input: SnapshotInput) {
      const resolvedVersionId = input.versionId ?? pageVersionId()
      const snapshot = normalizePageVersionRecord({
        id: resolvedVersionId,
        versionId: resolvedVersionId,
        releaseId: input.releaseId,
        storeId: input.storeId,
        slug: input.slug ?? HOME_PAGE_SLUG,
        pageType: input.pageType ?? HOME_PAGE_TYPE,
        createdAt: new Date().toISOString(),
        source: input.source ?? 'publish',
        blocks: input.blocks.map((block) => ({
          id: block.id,
          releaseId: input.releaseId,
          position: block.position,
          type: block.type,
          version: 'v1',
          payloadJson: block.payloadJson,
          enabled: block.enabled !== false,
        })),
      })

      if (!useFileStore) return snapshotDbPageVersion(snapshot)

      const state = await readState()
      state.versions.unshift(snapshot)
      await writeState(state)
      return snapshot
    },

    async getPageVersionById(id: string) {
      if (!useFileStore) return getDbPageVersionById(id)
      const state = await readState()
      return state.versions.find((version) => version.id === id || version.versionId === id) ?? null
    },

    async getPageVersionByReleaseId(releaseId: string) {
      if (!useFileStore) return getDbPageVersionByReleaseId(releaseId)
      const state = await readState()
      return state.versions.find((version) => version.releaseId === releaseId) ?? null
    },

    async findLatestPageVersionByRelease(input: { releaseId: string; storeId: string; slug?: string }) {
      const slug = input.slug ?? HOME_PAGE_SLUG
      if (!useFileStore) return findLatestDbPageVersionByRelease({ ...input, slug })
      const state = await readState()
      return (
        state.versions.find(
          (version) =>
            version.releaseId === input.releaseId &&
            version.storeId === input.storeId &&
            version.slug === slug,
        ) ?? null
      )
    },
  }
}

const defaultStore = createPageVersionStore()

export async function readPageVersionState() {
  return defaultStore.readPageVersionState()
}

export async function writePageVersionState(state: PageVersionStoreState) {
  await ensureAdminDataDir()
  return defaultStore.writePageVersionState(state)
}

export async function createPageVersionSnapshot(input: {
  releaseId: string
  storeId: string
  slug?: string
  pageType?: string
  source: PageVersionSource
  blocks: ReleaseBlockRecord[]
}) {
  return defaultStore.snapshotPageVersion({
    releaseId: input.releaseId,
    storeId: input.storeId,
    slug: input.slug,
    pageType: input.pageType,
    source: input.source,
    blocks: input.blocks,
  })
}

export async function getPageVersionById(id: string) {
  return defaultStore.getPageVersionById(id)
}

export async function getPageVersionByReleaseId(releaseId: string) {
  return defaultStore.getPageVersionByReleaseId(releaseId)
}

export async function findLatestPageVersionByRelease(input: {
  releaseId: string
  storeId: string
  slug?: string
}) {
  return defaultStore.findLatestPageVersionByRelease(input)
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

import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(TEST_DIR, '../../../../..')

const PAGE_CONFIG_STORE_PATH = path.join(
  REPO_ROOT,
  'apps',
  'next',
  'app',
  'api',
  '_lib',
  'page-config-store.ts',
)
const PAGE_VERSION_STORE_PATH = path.join(
  REPO_ROOT,
  'apps',
  'next',
  'app',
  'api',
  '_lib',
  'page-version-store.ts',
)
const RELEASE_BLOCKS_ROUTE_PATH = path.join(
  REPO_ROOT,
  'apps',
  'next',
  'app',
  'api',
  'admin',
  'release-blocks',
  'route.ts',
)
const RELEASE_BLOCK_ROUTE_PATH = path.join(
  REPO_ROOT,
  'apps',
  'next',
  'app',
  'api',
  'admin',
  'release-blocks',
  '[id]',
  'route.ts',
)
const RELEASE_PUBLISH_ROUTE_PATH = path.join(
  REPO_ROOT,
  'apps',
  'next',
  'app',
  'api',
  'admin',
  'releases',
  '[id]',
  'publish',
  'route.ts',
)
const PREVIEW_TOKEN_ROUTE_PATH = path.join(
  REPO_ROOT,
  'apps',
  'next',
  'app',
  'api',
  'admin',
  'preview-token',
  'route.ts',
)
const HOME_CMS_SERVICE_PATH = path.join(
  REPO_ROOT,
  'apps',
  'next',
  'server',
  'services',
  'home',
  'home-cms.service.ts',
)
const PREVIEW_TOKEN_LIB_PATH = path.join(
  REPO_ROOT,
  'apps',
  'next',
  'app',
  'api',
  '_lib',
  'preview-token.ts',
)

test('page config and version stores expose draft sync and release snapshot helpers', async () => {
  const [pageConfigStoreSource, pageVersionStoreSource] = await Promise.all([
    fs.readFile(PAGE_CONFIG_STORE_PATH, 'utf8'),
    fs.readFile(PAGE_VERSION_STORE_PATH, 'utf8'),
  ])

  assert.match(pageConfigStoreSource, /export type PageConfigRecord/)
  assert.match(pageConfigStoreSource, /export async function syncReleaseBlocksToPageDraft/)
  assert.match(pageConfigStoreSource, /export async function removeBlockFromPageDraft/)

  assert.match(pageVersionStoreSource, /export type PageVersionRecord/)
  assert.match(pageVersionStoreSource, /export async function createPageVersionSnapshot/)
  assert.match(pageVersionStoreSource, /export async function getPageVersionById/)
  assert.match(pageVersionStoreSource, /export async function findLatestPageVersionByRelease/)
})

test('admin release and preview routes wire through page draft sync and stable version snapshots', async () => {
  const [
    releaseBlocksRouteSource,
    releaseBlockRouteSource,
    releasePublishRouteSource,
    previewTokenRouteSource,
    homeCmsServiceSource,
    previewTokenLibSource,
  ] = await Promise.all([
    fs.readFile(RELEASE_BLOCKS_ROUTE_PATH, 'utf8'),
    fs.readFile(RELEASE_BLOCK_ROUTE_PATH, 'utf8'),
    fs.readFile(RELEASE_PUBLISH_ROUTE_PATH, 'utf8'),
    fs.readFile(PREVIEW_TOKEN_ROUTE_PATH, 'utf8'),
    fs.readFile(HOME_CMS_SERVICE_PATH, 'utf8'),
    fs.readFile(PREVIEW_TOKEN_LIB_PATH, 'utf8'),
  ])

  assert.match(releaseBlocksRouteSource, /syncReleaseBlocksToPageDraft/)
  assert.match(releaseBlockRouteSource, /syncReleaseBlocksToPageDraft|removeBlockFromPageDraft/)
  assert.match(releasePublishRouteSource, /createPageVersionSnapshot/)
  assert.match(previewTokenRouteSource, /createPageVersionSnapshot/)
  assert.match(previewTokenRouteSource, /createPreviewToken\(releaseId, storeId, 60 \* 30, pageVersion\.id\)/)
  assert.match(homeCmsServiceSource, /getPageVersionById|findLatestPageVersionByRelease/)
  assert.match(previewTokenLibSource, /versionId\?: string/)
  assert.match(previewTokenLibSource, /versionId: parsed\.versionId/)
})

import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(TEST_DIR, '../../../../..')

const ADMIN_BLOCKS_PAGE_PATH = path.join(
  REPO_ROOT,
  'apps',
  'next',
  'app',
  'admin',
  'marketing',
  'cms',
  'blocks',
  'page.tsx',
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
const RELEASES_ROUTE_PATH = path.join(
  REPO_ROOT,
  'apps',
  'next',
  'app',
  'api',
  'admin',
  'releases',
  'route.ts',
)
const PAGE_TYPES_PATH = path.join(
  REPO_ROOT,
  'packages',
  'app',
  'lib',
  'layout',
  'page-types.ts',
)

test('admin editor is scoped as page-block editing instead of homepage release slots', async () => {
  const [adminBlocksPageSource, pageTypesSource] = await Promise.all([
    fs.readFile(ADMIN_BLOCKS_PAGE_PATH, 'utf8'),
    fs.readFile(PAGE_TYPES_PATH, 'utf8'),
  ])

  assert.match(pageTypesSource, /export type AdminPageBlockScope =/)
  assert.match(pageTypesSource, /export const DEFAULT_PAGE_BLOCK_SCOPE =/)
  assert.match(adminBlocksPageSource, /const \[pageScope, setPageScope\] = useState/)
  assert.match(adminBlocksPageSource, /storeId: pageScope\.storeId/)
  assert.match(adminBlocksPageSource, /slug: pageScope\.slug/)
  assert.match(adminBlocksPageSource, /Page Blocks/)
  assert.doesNotMatch(adminBlocksPageSource, /No blocks yet/)
})

test('admin page-block routes support page\/store loading and preserve draft-publish flow', async () => {
  const [releaseBlocksRouteSource, releaseBlockRouteSource, releasesRouteSource] = await Promise.all([
    fs.readFile(RELEASE_BLOCKS_ROUTE_PATH, 'utf8'),
    fs.readFile(RELEASE_BLOCK_ROUTE_PATH, 'utf8'),
    fs.readFile(RELEASES_ROUTE_PATH, 'utf8'),
  ])

  assert.match(releaseBlocksRouteSource, /getPageConfigByReleaseId|getPageConfig\(/)
  assert.match(releaseBlocksRouteSource, /storeId/)
  assert.match(releaseBlocksRouteSource, /slug/)
  assert.match(releaseBlocksRouteSource, /pageType/)
  assert.match(releaseBlocksRouteSource, /listBlocks\(releaseId\)/)
  assert.match(releaseBlockRouteSource, /syncReleaseBlocksToPageDraft/)
  assert.match(releaseBlockRouteSource, /removeBlockFromPageDraft/)
  assert.match(releasesRouteSource, /upsertPageConfig/)
  assert.match(releasesRouteSource, /pageType: 'home'/)
})

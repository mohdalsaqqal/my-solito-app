import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url))
const API_ROOT = path.resolve(TEST_DIR, '..')
const LIST_ROUTE_PATH = path.join(TEST_DIR, 'route.ts')
const DETAIL_ROUTE_PATH = path.join(TEST_DIR, '[slug]', 'route.ts')
const SERVICE_PATH = path.join(
  TEST_DIR,
  '..',
  '..',
  '..',
  '..',
  'server',
  'services',
  'admin',
  'admin-product-queries.service.ts',
)
const RELEASE_BLOCKS_ROUTE_PATH = path.join(API_ROOT, 'release-blocks', 'route.ts')
const RELEASE_BLOCK_PATH = path.join(API_ROOT, 'release-blocks', '[id]', 'route.ts')

test('admin product query routes expose usage data and prevent deleting queries that are still referenced', async () => {
  const [listRouteSource, detailRouteSource, serviceSource] = await Promise.all([
    fs.readFile(LIST_ROUTE_PATH, 'utf8'),
    fs.readFile(DETAIL_ROUTE_PATH, 'utf8'),
    fs.readFile(SERVICE_PATH, 'utf8'),
  ])

  assert.match(serviceSource, /collectReleaseQueryUsages/)
  assert.match(serviceSource, /buildQueryUsageCountBySlug/)
  assert.match(serviceSource, /usageCount: usageCountBySlug\[query\.slug\] \?\? 0/)
  assert.match(listRouteSource, /listAdminProductQueries/)
  assert.match(detailRouteSource, /export async function GET/)
  assert.match(detailRouteSource, /getAdminProductQuery/)
  assert.match(detailRouteSource, /deleteAdminProductQuery/)
  assert.match(serviceSource, /usedBy,/)
  assert.match(serviceSource, /usageCount: usedBy\.length/)
  assert.match(serviceSource, /ADMIN_PRODUCT_QUERY_IN_USE/)
})

test('admin release block routes rely on shared query-reference validation', async () => {
  const [listRouteSource, detailRouteSource] = await Promise.all([
    fs.readFile(RELEASE_BLOCKS_ROUTE_PATH, 'utf8'),
    fs.readFile(RELEASE_BLOCK_PATH, 'utf8'),
  ])

  assert.match(listRouteSource, /validateBlockQueryReference/)
  assert.match(listRouteSource, /getBlockQueryReference/)
  assert.match(listRouteSource, /ADMIN_RELEASE_QUERY_REQUIRED/)
  assert.match(detailRouteSource, /validateBlockQueryReference/)
  assert.match(detailRouteSource, /getBlockQueryReference/)
  assert.match(detailRouteSource, /ADMIN_RELEASE_QUERY_INVALID/)
})

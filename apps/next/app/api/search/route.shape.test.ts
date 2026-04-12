import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(TEST_DIR, '../../../../..')
const SEARCH_ROUTE_PATH = path.join(TEST_DIR, 'route.ts')
const SEARCH_SERVICE_PATH = path.join(REPO_ROOT, 'apps', 'next', 'server', 'services', 'search', 'search.service.ts')
const PAGE_SCHEMA_PATH = path.join(REPO_ROOT, 'packages', 'app', 'lib', 'layout', 'page-schema.ts')
const PAGE_TYPES_PATH = path.join(REPO_ROOT, 'packages', 'app', 'lib', 'layout', 'page-types.ts')

test('search route emits an additive normalized page payload contract', async () => {
  const [routeSource, serviceSource, pageSchemaSource, pageTypesSource] = await Promise.all([
    fs.readFile(SEARCH_ROUTE_PATH, 'utf8'),
    fs.readFile(SEARCH_SERVICE_PATH, 'utf8'),
    fs.readFile(PAGE_SCHEMA_PATH, 'utf8'),
    fs.readFile(PAGE_TYPES_PATH, 'utf8'),
  ])

  assert.match(pageSchemaSource, /export function createPagePayload/)
  assert.match(pageTypesSource, /export const SEARCH_PAGE_TYPE = 'search'/)
  assert.match(routeSource, /getSearchPayload/)
  assert.match(serviceSource, /storeId/)
  assert.match(serviceSource, /page: createPagePayload\(/)
  assert.match(serviceSource, /pageType: SEARCH_PAGE_TYPE/)
  assert.match(serviceSource, /blocks: searchPageBlocks\.map/)
})

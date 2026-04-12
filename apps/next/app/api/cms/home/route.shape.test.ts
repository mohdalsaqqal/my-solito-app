import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(TEST_DIR, '../../../../../..')
const TYPES_PATH = path.join(REPO_ROOT, 'packages', 'app', 'lib', 'types.ts')
const PAGE_SCHEMA_PATH = path.join(REPO_ROOT, 'packages', 'app', 'lib', 'layout', 'page-schema.ts')
const PAGE_TYPES_PATH = path.join(REPO_ROOT, 'packages', 'app', 'lib', 'layout', 'page-types.ts')
const PAGE_CONFIG_CONTRACT_PATH = path.join(REPO_ROOT, 'packages', 'providers', 'contracts', 'page-config.ts')
const ROUTE_PATH = path.join(TEST_DIR, 'route.ts')
const SERVICE_PATH = path.join(
  REPO_ROOT,
  'apps',
  'next',
  'server',
  'services',
  'home',
  'home-cms.service.ts',
)

async function readSource(filePath: string) {
  return fs.readFile(filePath, 'utf8').catch(() => '')
}

test('homepage cms blocks are normalized for ordered direct rendering', async () => {
  const [typesSource, serviceSource] = await Promise.all([
    readSource(TYPES_PATH),
    readSource(SERVICE_PATH),
  ])

  assert.match(typesSource, /export type CMSHomeBlock = HomeBlock & \{/)
  assert.match(typesSource, /cardsLocalized\?: CMSHomeHeroCarouselCard\[\]/)
  assert.match(typesSource, /itemsLocalized\?: CMSHomeOfferBannerItem\[\]/)
  assert.match(typesSource, /hotspots\?: Array<\{/)
  assert.match(typesSource, /position: number/)
  assert.match(typesSource, /releaseId: string/)
  assert.match(typesSource, /homeBlocks\?: CMSHomeBlock\[\]/)
  assert.match(serviceSource, /const safeBlocks: CMSHomeBlock\[\] = \[\]/)
  assert.match(serviceSource, /if \(blockRecord\.enabled === false\) continue/)
  assert.match(serviceSource, /safeBlocks\.sort\(\(left, right\) => left\.position - right\.position\)/)
  assert.match(serviceSource, /cardsLocalized:/)
  assert.match(serviceSource, /itemsLocalized:/)
  assert.match(serviceSource, /if \(parsed\.type === 'editorial_hotspot'\)/)
  assert.match(serviceSource, /titleText:/)
})

test('homepage payload contract is backed by shared page schema files', async () => {
  const [typesSource, pageSchemaSource, pageTypesSource, pageConfigContractSource, serviceSource] =
    await Promise.all([
      readSource(TYPES_PATH),
      readSource(PAGE_SCHEMA_PATH),
      readSource(PAGE_TYPES_PATH),
      readSource(PAGE_CONFIG_CONTRACT_PATH),
      readSource(SERVICE_PATH),
    ])

  assert.match(pageSchemaSource, /createHomePagePayload|createPagePayload/)
  assert.match(pageTypesSource, /version/)
  assert.match(pageConfigContractSource, /PageConfig|NormalizedPagePayload|PageBlock/)
  assert.match(typesSource, /storeId: string/)
  assert.match(serviceSource, /const storeId = resolveStoreId\(request\)/)
  assert.match(serviceSource, /const page = createHomePagePayload\(/)
  assert.match(serviceSource, /storeId,/)
})

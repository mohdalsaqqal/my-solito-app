import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'

const TYPES_PATH = path.join(process.cwd(), 'packages', 'app', 'lib', 'types.ts')
const PAGE_SCHEMA_PATH = path.join(process.cwd(), 'packages', 'app', 'lib', 'layout', 'page-schema.ts')
const PAGE_TYPES_PATH = path.join(process.cwd(), 'packages', 'app', 'lib', 'layout', 'page-types.ts')
const PAGE_CONFIG_CONTRACT_PATH = path.join(process.cwd(), 'packages', 'providers', 'contracts', 'page-config.ts')
const ROUTE_PATH = path.join(process.cwd(), 'apps', 'next', 'app', 'api', 'cms', 'home', 'route.ts')

async function readSource(filePath: string) {
  return fs.readFile(filePath, 'utf8').catch(() => '')
}

test('homepage cms blocks are normalized for ordered direct rendering', async () => {
  const [typesSource, routeSource] = await Promise.all([
    readSource(TYPES_PATH),
    readSource(ROUTE_PATH),
  ])

  assert.match(typesSource, /export type CMSHomeBlock = HomeBlock & \{/)
  assert.match(typesSource, /cardsLocalized\?: CMSHomeHeroCarouselCard\[\]/)
  assert.match(typesSource, /itemsLocalized\?: CMSHomeOfferBannerItem\[\]/)
  assert.match(typesSource, /hotspots\?: Array<\{/)
  assert.match(typesSource, /position: number/)
  assert.match(typesSource, /releaseId: string/)
  assert.match(typesSource, /homeBlocks\?: CMSHomeBlock\[\]/)
  assert.match(routeSource, /const safeBlocks: CMSHomeBlock\[\] = \[\]/)
  assert.match(routeSource, /if \(blockRecord\.enabled === false\) continue/)
  assert.match(routeSource, /safeBlocks\.sort\(\(left, right\) => left\.position - right\.position\)/)
  assert.match(routeSource, /cardsLocalized:/)
  assert.match(routeSource, /itemsLocalized:/)
  assert.match(routeSource, /if \(parsed\.type === 'editorial_hotspot'\)/)
  assert.match(routeSource, /titleText:/)
})

test('homepage payload contract is backed by shared page schema files', async () => {
  const [typesSource, pageSchemaSource, pageTypesSource, pageConfigContractSource, routeSource] =
    await Promise.all([
      readSource(TYPES_PATH),
      readSource(PAGE_SCHEMA_PATH),
      readSource(PAGE_TYPES_PATH),
      readSource(PAGE_CONFIG_CONTRACT_PATH),
      readSource(ROUTE_PATH),
    ])

  assert.match(pageSchemaSource, /storeId/)
  assert.match(pageTypesSource, /version/)
  assert.match(pageConfigContractSource, /PageConfig|PagePayload|PageBlock/)
  assert.match(typesSource, /storeId: string/)
  assert.match(routeSource, /storeId/)
})

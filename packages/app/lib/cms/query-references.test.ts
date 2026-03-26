import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'

const QUERY_REFERENCES_PATH = path.join(process.cwd(), 'packages', 'app', 'lib', 'cms', 'query-references.ts')
const PAGE_TYPES_PATH = path.join(process.cwd(), 'packages', 'app', 'lib', 'layout', 'page-types.ts')
const PAGE_CONFIG_CONTRACT_PATH = path.join(process.cwd(), 'packages', 'providers', 'contracts', 'page-config.ts')

test('shared query reference helper covers usage derivation and static personalized rail validation', async () => {
  const source = await fs.readFile(QUERY_REFERENCES_PATH, 'utf8')

  assert.match(source, /export function getBlockQueryReference/)
  assert.match(source, /case 'product_slider':/)
  assert.match(source, /case 'brand_promo':/)
  assert.match(source, /case 'brand_spotlight':/)
  assert.match(source, /case 'personalized_rail':/)
  assert.match(source, /required: block\.mode === 'static'/)
  assert.match(source, /case 'cart_upsell_rail':/)
  assert.match(source, /collectReleaseQueryUsages/)
  assert.match(source, /buildQueryUsageCountBySlug/)
  assert.match(source, /getQueryUsagesForSlug/)
})

test('layout block contracts expose supported block unions and product query resolver contracts', async () => {
  const [queryReferenceSource, pageTypesSource, pageConfigContractSource] = await Promise.all([
    fs.readFile(QUERY_REFERENCES_PATH, 'utf8'),
    fs.readFile(PAGE_TYPES_PATH, 'utf8'),
    fs.readFile(PAGE_CONFIG_CONTRACT_PATH, 'utf8'),
  ])

  assert.match(pageTypesSource, /export type SupportedPageBlockType =/)
  assert.match(pageTypesSource, /export type QueryBoundBlockType =/)
  assert.match(pageConfigContractSource, /export type ProductQueryResolverInput =/)
  assert.match(pageConfigContractSource, /export type ProductQueryResolverResult =/)
  assert.match(queryReferenceSource, /export function getProductQueryResolverInput/)
})

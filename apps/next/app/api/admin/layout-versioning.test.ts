import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { pathToFileURL } from 'node:url'

const PAGE_CONFIG_STORE_PATH = path.join(
  process.cwd(),
  'apps',
  'next',
  'app',
  'api',
  '_lib',
  'page-config-store.ts'
)
const PAGE_VERSION_STORE_PATH = path.join(
  process.cwd(),
  'apps',
  'next',
  'app',
  'api',
  '_lib',
  'page-version-store.ts'
)
const RELEASE_BLOCKS_ROUTE_PATH = path.join(
  process.cwd(),
  'apps',
  'next',
  'app',
  'api',
  'admin',
  'release-blocks',
  'route.ts'
)
const RELEASE_BLOCK_DETAIL_ROUTE_PATH = path.join(
  process.cwd(),
  'apps',
  'next',
  'app',
  'api',
  'admin',
  'release-blocks',
  '[id]',
  'route.ts'
)
const RELEASE_PUBLISH_ROUTE_PATH = path.join(
  process.cwd(),
  'apps',
  'next',
  'app',
  'api',
  'admin',
  'releases',
  '[id]',
  'publish',
  'route.ts'
)
const PREVIEW_TOKEN_ROUTE_PATH = path.join(
  process.cwd(),
  'apps',
  'next',
  'app',
  'api',
  'admin',
  'preview-token',
  'route.ts'
)

test('internal page config and page version stores exist for layout persistence', async () => {
  const [pageConfigSource, pageVersionSource] = await Promise.all([
    fs.readFile(PAGE_CONFIG_STORE_PATH, 'utf8'),
    fs.readFile(PAGE_VERSION_STORE_PATH, 'utf8'),
  ])

  assert.match(pageConfigSource, /export type PageConfigRecord/)
  assert.match(pageConfigSource, /storeId: string/)
  assert.match(pageConfigSource, /pageType: string/)
  assert.match(pageConfigSource, /slug: string/)
  assert.match(pageConfigSource, /releaseId: string/)
  assert.match(pageConfigSource, /blocks:/)

  assert.match(pageVersionSource, /export type PageVersionRecord/)
  assert.match(pageVersionSource, /versionId: string/)
  assert.match(pageVersionSource, /releaseId: string/)
  assert.match(pageVersionSource, /storeId: string/)
  assert.match(pageVersionSource, /pageType: string/)
  assert.match(pageVersionSource, /slug: string/)
  assert.match(pageVersionSource, /blocks:/)
})

test('admin release routes use page config and page version stores behind current APIs', async () => {
  const [releaseBlocksSource, releaseBlockDetailSource, publishSource, previewSource] =
    await Promise.all([
      fs.readFile(RELEASE_BLOCKS_ROUTE_PATH, 'utf8'),
      fs.readFile(RELEASE_BLOCK_DETAIL_ROUTE_PATH, 'utf8'),
      fs.readFile(RELEASE_PUBLISH_ROUTE_PATH, 'utf8'),
      fs.readFile(PREVIEW_TOKEN_ROUTE_PATH, 'utf8'),
    ])

  assert.match(releaseBlocksSource, /page-config-store/)
  assert.match(releaseBlocksSource, /releaseId/)
  assert.match(releaseBlockDetailSource, /page-config-store/)
  assert.match(publishSource, /page-version-store/)
  assert.match(publishSource, /snapshot/i)
  assert.match(previewSource, /page-(config|version)-store/)
})

test('page version store snapshots block order and props by page and store', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-version-store-'))
  const storageFile = path.join(tempDir, 'page-version-store.json')

  const mod = await import(pathToFileURL(PAGE_VERSION_STORE_PATH).href)

  assert.equal(typeof mod.createPageVersionStore, 'function')

  const store = mod.createPageVersionStore({ storageFile })
  const created = await store.snapshotPageVersion({
    versionId: 'ver-home-default-1',
    releaseId: 'rel-home-default-1',
    storeId: 'default',
    pageType: 'home',
    slug: '/',
    blocks: [
      {
        id: 'blk-hero-1',
        position: 1,
        type: 'hero',
        payloadJson: { id: 'hero-main', type: 'hero', title: { en: 'Hero', ar: 'هيرو' } },
        enabled: true,
      },
      {
        id: 'blk-slider-1',
        position: 2,
        type: 'product_slider',
        payloadJson: { id: 'slider-main', type: 'product_slider', querySlug: 'home-best-items' },
        enabled: true,
      },
    ],
  })

  assert.equal(created.releaseId, 'rel-home-default-1')
  assert.equal(created.storeId, 'default')
  assert.equal(created.pageType, 'home')
  assert.equal(created.slug, '/')
  assert.deepEqual(
    created.blocks.map((block: { id: string; position: number; type: string }) => ({
      id: block.id,
      position: block.position,
      type: block.type,
    })),
    [
      { id: 'blk-hero-1', position: 1, type: 'hero' },
      { id: 'blk-slider-1', position: 2, type: 'product_slider' },
    ]
  )

  const resolved = await store.getPageVersionByReleaseId('rel-home-default-1')
  assert.equal(resolved?.versionId, 'ver-home-default-1')
  assert.equal(resolved?.blocks[1]?.payloadJson?.querySlug, 'home-best-items')
})

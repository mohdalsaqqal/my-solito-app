import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'

const SCREEN_PATH = path.join(process.cwd(), 'packages', 'app', 'screens', 'SearchResultsScreen.tsx')
const BLOCK_TYPES_PATH = path.join(process.cwd(), 'packages', 'app', 'sections', 'blocks', 'block-types.ts')
const BLOCK_REGISTRY_PATH = path.join(process.cwd(), 'packages', 'app', 'sections', 'blocks', 'block-registry.ts')

test('search results screen can render normalized page blocks through the shared registry', async () => {
  const [screenSource, blockTypesSource, blockRegistrySource] = await Promise.all([
    fs.readFile(SCREEN_PATH, 'utf8'),
    fs.readFile(BLOCK_TYPES_PATH, 'utf8'),
    fs.readFile(BLOCK_REGISTRY_PATH, 'utf8'),
  ])

  assert.match(blockTypesSource, /export type RegisteredStorefrontPageBlock =/)
  assert.match(blockRegistrySource, /getBlockComponent/)
  assert.match(screenSource, /import \{ BlockRenderer \} from '@real\/app\/sections\/blocks\/BlockRenderer'/)
  assert.match(screenSource, /searchPageBlocks/)
  assert.match(screenSource, /page\?:/)
  assert.match(screenSource, /searchPageBlocks\.map\(\(block\) => \(/)
  assert.match(screenSource, /<BlockRenderer/)
})

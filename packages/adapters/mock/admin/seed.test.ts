import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'

const SEED_PATH = path.join(process.cwd(), 'packages', 'adapters', 'mock', 'admin', 'seed.ts')
const STORE_PATH = path.join(process.cwd(), 'packages', 'adapters', 'mock', 'admin', 'store.ts')

test('admin mock seed uses generated product data instead of generic placeholder catalog rows', async () => {
  const [seedSource, storeSource] = await Promise.all([
    fs.readFile(SEED_PATH, 'utf8'),
    fs.readFile(STORE_PATH, 'utf8'),
  ])

  assert.match(seedSource, /import \{ generatedMockProductRows \} from '\.\.\/product\/generated-mock-erp-data'/)
  assert.match(seedSource, /const sourceProducts = generatedMockProductRows as SourceProductRow\[]/)
  assert.match(seedSource, /title: product\.name/)
  assert.match(seedSource, /sku: product\.vendor_sku \?\? `SKU-\$\{index \+ 1\}`/)
  assert.match(seedSource, /image: product\.image/)
  assert.match(storeSource, /const needsProductReseed = state\.products\.some/)
  assert.match(storeSource, /\^SKU-\\d\+\$/)
  assert.match(storeSource, /Product \\d\+\$/i)
})

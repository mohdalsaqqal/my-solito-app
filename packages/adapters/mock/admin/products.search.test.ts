import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'

const PRODUCTS_PATH = path.join(process.cwd(), 'packages', 'adapters', 'mock', 'admin', 'products.ts')

test('mock admin product search ranks title and brand fields ahead of broad catalog matches', async () => {
  const source = await fs.readFile(PRODUCTS_PATH, 'utf8')

  assert.match(source, /const scoreRow = \(row: ProductRow\) => \{/)
  assert.match(source, /if \(title === needle\) return 120/)
  assert.match(source, /if \(brand === needle\) return 110/)
  assert.match(source, /if \(sku === needle \|\| id === needle\) return 100/)
  assert.match(source, /\.filter\(\(entry\) => entry\.score > 0\)/)
  assert.match(source, /\.sort\(\(left, right\) => right\.score - left\.score \|\| left\.row\.title\.localeCompare\(right\.row\.title\)\)/)
})

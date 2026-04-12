import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'

const RAIL_PATH = path.join(
  process.cwd(),
  'packages',
  'ui',
  'components',
  'home-v2',
  'BestItemsMonthRail.tsx',
)

test('best items month rail supports autoplay for brand spotlight product rows', async () => {
  const source = await fs.readFile(RAIL_PATH, 'utf8')

  assert.match(source, /autoplay\?: boolean/)
  assert.match(source, /autoplayMs\?: number/)
  assert.match(source, /autoplay = false/)
  assert.match(source, /autoplayMs = 4200/)
  assert.match(source, /autoplay=\{autoplay\}/)
  assert.match(source, /autoplayMs=\{autoplayMs\}/)
  assert.match(source, /itemCount=\{items\.length\}/)
})

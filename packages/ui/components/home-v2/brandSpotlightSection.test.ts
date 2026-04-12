import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'

const SECTION_PATH = path.join(
  process.cwd(),
  'packages',
  'ui',
  'components',
  'home-v2',
  'BrandSpotlightSection.tsx',
)

test('brand spotlight section renders its rail whenever products are available', async () => {
  const source = await fs.readFile(SECTION_PATH, 'utf8')

  assert.match(source, /\{items\.length > 0 \? \(/)
  assert.doesNotMatch(source, /items\.length >= 3/)
})

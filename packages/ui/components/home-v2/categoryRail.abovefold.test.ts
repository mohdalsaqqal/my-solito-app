import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'

const CATEGORY_RAIL_PATH = path.join(
  process.cwd(),
  'packages',
  'ui',
  'components',
  'home-v2',
  'CategoryRail.tsx',
)

test('category rail uses the above-the-fold merchandising header and framed hover treatment', async () => {
  const source = await fs.readFile(CATEGORY_RAIL_PATH, 'utf8')

  assert.match(source, /Shop by category/)
  assert.match(source, /Move quickly between active beauty categories without losing campaign momentum\./)
  assert.match(source, /backgroundColor: colors\.background/)
  assert.match(source, /borderRadius: radius\.sm/)
  assert.match(source, /boxShadow: active \? elevation\.sm : elevation\.none/)
})

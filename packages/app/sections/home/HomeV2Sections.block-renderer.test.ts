import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'

const SECTION_PATH = path.join(process.cwd(), 'packages', 'app', 'sections', 'home', 'HomeV2Sections.tsx')

test('home sections remain legacy-composer-only and do not dispatch published CMS blocks', async () => {
  const source = await fs.readFile(SECTION_PATH, 'utf8')

  assert.doesNotMatch(source, /homeBlocks\?:/)
  assert.doesNotMatch(source, /orderedHomeBlocks/)
  assert.doesNotMatch(source, /<HomeBlocksRenderer/)

  assert.match(source, /AnnouncementTicker/)
  assert.match(source, /HeroTileRail/)
  assert.match(source, /ProductRail/)
  assert.match(source, /OfferBannersGrid/)
})

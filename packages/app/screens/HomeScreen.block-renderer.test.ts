import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'

const SCREEN_PATH = path.join(process.cwd(), 'packages', 'app', 'screens', 'HomeScreen.tsx')
const HOME_SECTIONS_PATH = path.join(process.cwd(), 'packages', 'app', 'sections', 'home', 'HomeV2Sections.tsx')

test('home screen routes published blocks to HomeBlocksRenderer and keeps legacy as fallback only', async () => {
  const source = await fs.readFile(SCREEN_PATH, 'utf8')

  assert.match(source, /function HomeBlocksScreen\(/)
  assert.match(source, /<HomeBlocksRenderer[\s\S]{0,1200}blocks=\{blocks\}/)
  assert.match(source, /const publishedHomeBlocks = props\.cmsHome\?\.page\?\.blocks \?\? null/)
  assert.match(source, /if \(hasPublishedHomeBlocks\) \{\s*return <HomeBlocksScreen \{\.\.\.props\} \/>\s*\}/)
  assert.match(source, /return <HomeLegacyScreen \{\.\.\.props\} \/>/)
})

test('legacy HomeV2Sections no longer owns published-block rendering', async () => {
  const source = await fs.readFile(HOME_SECTIONS_PATH, 'utf8')

  assert.doesNotMatch(source, /homeBlocks\?:/)
  assert.doesNotMatch(source, /orderedHomeBlocks/)
  assert.doesNotMatch(source, /<HomeBlocksRenderer/)
  assert.match(source, /heroItems = \[\]/)
  assert.match(source, /tickerItems = \[\]/)
})

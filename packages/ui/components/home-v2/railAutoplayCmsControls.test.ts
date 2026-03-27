import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'

const HOME_PATH = path.join(
  process.cwd(),
  'packages',
  'ui',
  '_reference',
  'SephoraReferenceHome.tsx',
)

const SCREEN_PATH = path.join(process.cwd(), 'packages', 'app', 'screens', 'HomeScreen.tsx')
const CMS_PATH = path.join(process.cwd(), 'packages', 'adapters', 'mock', 'cms', 'index.ts')

test('home rails support CMS-driven autoplay controls', async () => {
  const [homeSource, screenSource, cmsSource] = await Promise.all([
    fs.readFile(HOME_PATH, 'utf8'),
    fs.readFile(SCREEN_PATH, 'utf8'),
    fs.readFile(CMS_PATH, 'utf8'),
  ])

  assert.match(homeSource, /type HomeRailAutoplaySettings = \{/)
  assert.match(homeSource, /function useAutoScrollRail\(/)
  assert.match(homeSource, /enabled: railAutoplay\?\.hero\?\.enabled/)
  assert.match(homeSource, /enabled: railAutoplay\?\.categories\?\.enabled/)
  assert.match(homeSource, /enabled: railAutoplay\?\.newArrivals\?\.enabled/)
  assert.match(homeSource, /enabled: railAutoplay\?\.featured\?\.enabled/)
  assert.match(homeSource, /autoplay=\{railAutoplay\?\.brandSpotlights\}/)

  assert.match(screenSource, /railAutoplay=\{\{/)
  assert.match(screenSource, /cmsHome\?\.marketing\?\.railAutoplay\?\.hero\?\.enabled/)
  assert.match(cmsSource, /railAutoplay: \{/)
  assert.match(cmsSource, /brandSpotlights: \{/)
})

import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'

const SCREEN_PATH = path.join(process.cwd(), 'packages', 'app', 'screens', 'HomeScreen.tsx')
const HOME_SECTIONS_PATH = path.join(process.cwd(), 'packages', 'app', 'sections', 'home', 'HomeV2Sections.tsx')
const BLOCK_TYPES_PATH = path.join(process.cwd(), 'packages', 'app', 'sections', 'blocks', 'block-types.ts')
const BLOCK_REGISTRY_PATH = path.join(process.cwd(), 'packages', 'app', 'sections', 'blocks', 'block-registry.ts')
const BLOCK_RENDERER_PATH = path.join(process.cwd(), 'packages', 'app', 'sections', 'blocks', 'BlockRenderer.tsx')

test('homepage body prefers the direct published block path and keeps legacy fallback only for no-release cases', async () => {
  const screenSource = await fs.readFile(SCREEN_PATH, 'utf8')

  assert.match(
    screenSource,
    /const publishedHomeBlocks = cmsHome\?\.page\?\.blocks \?\? null/,
  )
  assert.match(
    screenSource,
    /const homeSections = hasPublishedHomeBlocks \? \([\s\S]{0,1600}<HomeSectionsAny[\s\S]{0,1600}homeBlocks=\{publishedHomeBlocks\}/,
  )
  assert.match(
    screenSource,
    /:\s*\([\s\S]{0,2200}<HomeSectionsAny[\s\S]{0,2200}heroItems=\{heroItems\}[\s\S]{0,2200}bestSellersRail=\{rails\.bestSellers\}[\s\S]{0,2200}personalizedRail=\{personalizedRail\}/,
  )
})

test('native home screen wraps sections in a vertical ScrollView so Expo can scroll long home content', async () => {
  const screenSource = await fs.readFile(SCREEN_PATH, 'utf8')

  assert.match(screenSource, /import \{ Platform, ScrollView \} from 'react-native'/)
  assert.match(screenSource, /if \(Platform\.OS !== 'web'\) \{[\s\S]{0,400}<ScrollView/)
  assert.match(screenSource, /contentContainerStyle=\{\{ flexGrow: 1 \}\}/)
})

test('shared block renderer uses an explicit registry lookup by type and version with safe fallback', async () => {
  const [homeSectionsSource, blockTypesSource, blockRegistrySource, blockRendererSource] = await Promise.all([
    fs.readFile(HOME_SECTIONS_PATH, 'utf8').catch(() => ''),
    fs.readFile(BLOCK_TYPES_PATH, 'utf8').catch(() => ''),
    fs.readFile(BLOCK_REGISTRY_PATH, 'utf8').catch(() => ''),
    fs.readFile(BLOCK_RENDERER_PATH, 'utf8').catch(() => ''),
  ])

  assert.match(blockTypesSource, /export type RegisteredHomePageBlock =/)
  assert.match(blockRegistrySource, /export const blockRegistry =/)
  assert.match(blockRegistrySource, /type \+ version|typeVersion|getBlockRegistryKey|getBlockComponent/)
  assert.match(blockRendererSource, /export function BlockRenderer/)
  assert.match(blockRendererSource, /if \(!BlockComponent\)/)
  assert.match(homeSectionsSource, /BlockRenderer/)
})

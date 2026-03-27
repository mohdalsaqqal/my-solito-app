import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'

const UI_TYPES_PATH = path.join(process.cwd(), 'packages', 'ui', 'components', 'home', 'types.ts')
const APP_TYPES_PATH = path.join(process.cwd(), 'packages', 'app', 'lib', 'types.ts')
const SCREEN_PATH = path.join(process.cwd(), 'packages', 'app', 'screens', 'HomeScreen.tsx')
const SECTIONS_PATH = path.join(process.cwd(), 'packages', 'app', 'sections', 'home', 'HomeV2Sections.tsx')
const HOME_PATH = path.join(process.cwd(), 'packages', 'ui', '_reference', 'SephoraReferenceHome.tsx')
const COMPONENT_PATH = path.join(process.cwd(), 'packages', 'ui', 'components', 'home-v2', 'EditorialHotspotSection.tsx')
const CMS_PATH = path.join(process.cwd(), 'packages', 'adapters', 'mock', 'cms', 'index.ts')

test('editorial hotspot section is typed and wired through the home page stack', async () => {
  const [uiTypesSource, appTypesSource, screenSource, sectionsSource, homeSource, cmsSource] = await Promise.all([
    fs.readFile(UI_TYPES_PATH, 'utf8'),
    fs.readFile(APP_TYPES_PATH, 'utf8'),
    fs.readFile(SCREEN_PATH, 'utf8'),
    fs.readFile(SECTIONS_PATH, 'utf8'),
    fs.readFile(HOME_PATH, 'utf8'),
    fs.readFile(CMS_PATH, 'utf8'),
  ])

  await assert.doesNotReject(() => fs.readFile(COMPONENT_PATH, 'utf8'))
  assert.match(uiTypesSource, /export type HomeEditorialHotspotItem = \{/)
  assert.match(uiTypesSource, /export type HomeEditorialHotspotSection = \{/)
  assert.match(appTypesSource, /editorialHotspotSection\?: \{/)
  assert.match(appTypesSource, /productIds\?: string\[]/)
  assert.match(cmsSource, /editorialHotspotSection: \{/)
  assert.match(screenSource, /const editorialHotspotSection = useMemo</)
  assert.match(sectionsSource, /section=\{\{\s*id: block\.id,/)
  assert.match(sectionsSource, /editorialHotspotSection\?: HomeEditorialHotspotSection \| null/)
  assert.match(screenSource, /editorialHotspotSection=\{editorialHotspotSection\}/)
  assert.match(homeSource, /editorialHotspotSection\?: HomeEditorialHotspotSection \| null/)
  assert.match(homeSource, /<EditorialHotspotSection/)
})

test('editorial hotspot section keeps the left side image-only while the right list stays CMS-driven', async () => {
  const [source, screenSource, cmsSource] = await Promise.all([
    fs.readFile(COMPONENT_PATH, 'utf8'),
    fs.readFile(SCREEN_PATH, 'utf8'),
    fs.readFile(CMS_PATH, 'utf8'),
  ])

  assert.match(source, /const \[hasHydrated, setHasHydrated\] = useState\(Platform\.OS !== 'web'\)/)
  assert.match(source, /setHasHydrated\(true\)/)
  assert.match(source, /const isSplitLayout = hasHydrated && width >= breakpoints\.tabletMin/)
  assert.match(source, /const isDesktop = hasHydrated && width >= breakpoints\.desktopMin/)
  assert.match(source, /const imagePanelSize = isDesktop/)
  assert.match(source, /componentTokens\.storefrontHome\.editorialHotspot\.desktopImageSize/)
  assert.match(source, /componentTokens\.storefrontHome\.editorialHotspot\.tabletImageSize/)
  assert.match(source, /flexDirection: isSplitLayout \? 'row' : 'column'/)
  assert.match(source, /width: imagePanelSize \?\? '100%'/)
  assert.match(source, /minHeight: imagePanelSize \?\? componentTokens\.storefrontHome\.hero\.mobileCardHeight \+ spacing\['48'\]/)
  assert.match(source, /Platform\.OS === 'web' \? \(/)
  assert.match(source, /<img/)
  assert.match(source, /src=\{section\.imageUrl\}/)
  assert.match(source, /resizeMode='contain'/)
  assert.doesNotMatch(source, /section\.hotspots\.map/)
  assert.match(source, /padStart\(2, '0'\)/)
  assert.match(screenSource, /const orderedProductIds = section\.productIds\?\.length/)
  assert.match(screenSource, /for \(const productId of orderedProductIds\.slice\(0, 4\)\)/)
  assert.match(screenSource, /: hotspots\.map\(\(hotspot\) => hotspot\.productId\)/)
  assert.match(cmsSource, /productIds: \['76959', '66583', '72078', '76960'\]/)
})

test('editorial hotspot section exposes add-all-to-cart wiring through the home page stack', async () => {
  const [componentSource, sectionsSource, screenSource] = await Promise.all([
    fs.readFile(COMPONENT_PATH, 'utf8'),
    fs.readFile(SECTIONS_PATH, 'utf8'),
    fs.readFile(SCREEN_PATH, 'utf8'),
  ])

  assert.match(componentSource, /onAddAllToCart\?: \(productIds: string\[\]\) => void/)
  assert.match(componentSource, /addAllToCartLabel\?: string/)
  assert.match(componentSource, /const addAllProductIds = useMemo\(/)
  assert.match(componentSource, /onAddAllToCart\(addAllProductIds\)/)
  assert.match(sectionsSource, /onAddAllToCart\?: \(productIds: string\[\]\) => void/)
  assert.match(sectionsSource, /addAllToCartLabel=\{locale === 'ar' \? 'أضف الكل إلى السلة' : 'Add all to cart'\}/)
  assert.match(screenSource, /onAddAllToCart\?: \(productIds: string\[\]\) => void/)
  assert.match(screenSource, /onAddAllToCart=\{onAddAllToCart\}/)
})

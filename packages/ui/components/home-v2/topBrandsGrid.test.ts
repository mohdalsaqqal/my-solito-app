import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'

const GRID_PATH = path.join(
  process.cwd(),
  'packages',
  'ui',
  'components',
  'home-v2',
  'TopBrandsGrid.tsx',
)

test('top brands grid uses tokenized logo tiles with desktop grid and mobile rail layouts', async () => {
  const source = await fs.readFile(GRID_PATH, 'utf8')

  assert.match(source, /function normalizeBrandLabel\(name: string\)/)
  assert.match(source, /const \[isHydrated, setIsHydrated\] = useState\(false\)/)
  assert.match(source, /useEffect\(\(\) => \{\s*setIsHydrated\(true\)\s*\}, \[\]\)/)
  assert.match(source, /useWindowDimensions/)
  assert.match(source, /componentTokens\.storefrontHome\.topBrands/)
  assert.match(source, /const isDesktop = isHydrated && width >= breakpoints\.lg/)
  assert.match(source, /flexWrap: 'wrap'/)
  assert.match(source, /justifyContent: 'center'/)
  assert.match(source, /<ScrollView/)
  assert.match(source, /numberOfLines=\{3\}/)
  assert.match(source, /backgroundColor: active \? colors\.surface : colors\.surfaceMuted/)
  assert.match(source, /maxWidth: `\$\{tokens\.tileTextMaxWidthRatio \* 100\}%`/)
  assert.match(source, /fontSize:\s*tileSize >= tokens\.tileSizeDesktop/)
  assert.match(source, /lineHeight:\s*tileSize >= tokens\.tileSizeDesktop/)
  assert.match(source, /letterSpacing: tokens\.tileTextTracking/)
  assert.match(source, /normalizeBrandLabel\(item\.name\)/)
  assert.doesNotMatch(source, /resizeMode='contain'/)
})

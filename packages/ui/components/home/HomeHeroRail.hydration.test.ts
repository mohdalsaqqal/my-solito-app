import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'

const HERO_RAIL_PATH = path.join(process.cwd(), 'packages', 'ui', 'components', 'home', 'HomeHeroRail.tsx')

test('home hero rail keeps the first web render width deterministic for hydration', async () => {
  const source = await fs.readFile(HERO_RAIL_PATH, 'utf8')

  assert.match(source, /const \[hasHydrated, setHasHydrated\] = useState\(Platform\.OS !== 'web'\)/)
  assert.match(source, /const effectiveWidth = Platform\.OS === 'web' && !hasHydrated \? 0 : width/)
  assert.match(source, /const viewportWidth = effectiveWidth \|\| layout\.containerMaxWidth/)
  assert.match(source, /const cardHeight = isDesktop/)
  assert.match(source, /contentContainerStyle=\{\{ gap: heroTokens\.railGap \}\}/)
  assert.match(source, /showDots=\{false\}/)
})

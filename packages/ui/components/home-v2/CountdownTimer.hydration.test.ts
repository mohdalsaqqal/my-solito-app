import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'

const COUNTDOWN_PATH = path.join(process.cwd(), 'packages', 'ui', 'components', 'home-v2', 'CountdownTimer.tsx')

test('countdown timer waits for hydration before rendering live web time', async () => {
  const source = await fs.readFile(COUNTDOWN_PATH, 'utf8')

  assert.match(source, /const \[hasHydrated, setHasHydrated\] = useState\(Platform\.OS !== 'web'\)/)
  assert.match(source, /Platform\.OS === 'web' \? null : getRemaining\(targetMs\.current\)/)
  assert.match(source, /if \(loading \|\| !hasHydrated \|\| !time\) \{/)
})

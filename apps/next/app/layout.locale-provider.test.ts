import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'

test('text rendering avoids client-only locale branching during hydration', () => {
  const layoutSource = readFileSync(new URL('./layout.tsx', import.meta.url), 'utf8')
  const textSource = readFileSync(new URL('../../../packages/ui/primitives/Text.tsx', import.meta.url), 'utf8')

  assert.doesNotMatch(layoutSource, /UiLocaleProvider/)
  assert.doesNotMatch(textSource, /createContext/)
  assert.doesNotMatch(textSource, /useContext/)
  assert.doesNotMatch(textSource, /document\.documentElement\.lang/)
})

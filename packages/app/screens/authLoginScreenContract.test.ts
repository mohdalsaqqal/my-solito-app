import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'

const SCREEN_PATH = path.join(process.cwd(), 'packages', 'app', 'screens', 'AuthLoginScreen.tsx')

test('auth login screen uses labeled fields, autofill semantics, and responsive split layout', async () => {
  const source = await fs.readFile(SCREEN_PATH, 'utf8')

  assert.match(source, /useWindowDimensions/)
  assert.match(source, /FormField/)
  assert.match(source, /autoComplete='username'/)
  assert.match(source, /autoComplete='current-password'/)
  assert.match(source, /showPassword/)
  assert.match(source, /<Alert tone='error'/)
  assert.match(source, /useCurrentLocale/)
  assert.match(source, /copy\.login\.heroTitle/)
})

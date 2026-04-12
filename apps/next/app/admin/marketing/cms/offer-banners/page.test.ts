import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'

const PAGE_PATH = path.join(process.cwd(), 'apps', 'next', 'app', 'admin', 'marketing', 'cms', 'offer-banners', 'page.tsx')

test('offer banners admin upload flow reads the standard API success envelope', async () => {
  const source = await fs.readFile(PAGE_PATH, 'utf8')

  assert.match(source, /apiClient\.admin\.uploadOfferBannerImage\(/)
  assert.match(source, /if \(!upload\?\.url\) throw new Error\('Upload failed'\)/)
  assert.doesNotMatch(source, /fetch\('\/api\/admin\/cms\/offer-banners\/upload'/)
})

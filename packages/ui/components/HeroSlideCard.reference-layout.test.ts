import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'

const CARD_PATH = path.join(process.cwd(), 'packages', 'ui', 'components', 'HeroSlideCard.tsx')

test('hero slide card keeps the split-card structure while upgrading the shell treatment', async () => {
  const source = await fs.readFile(CARD_PATH, 'utf8')

  assert.match(source, /const imageHeight = Math\.round\(height \* heroTokens\.imageAreaRatio\)/)
  assert.match(source, /const panelHeight = Math\.max\(0, height - imageHeight\)/)
  assert.match(source, /const ultraCompactPanel = panelHeight <= 112/)
  assert.match(source, /fontFamily: fontFamilies\.heading/)
  assert.match(source, /curated beauty edit/)
  assert.match(source, /const HERO_PANEL_BACKGROUND = colors\.inkBlack/)
  assert.match(source, /rgba\(31,31,31,1\)/)
  assert.match(source, /item\.ctaLabel && ultraCompactPanel/)
  assert.match(source, /backgroundImage: HERO_MEDIA_OVERLAY_GRADIENT/)
  assert.match(source, /borderRadius: radius\.sm/)
  assert.match(source, /boxShadow: active \? elevation\.lg : elevation\.sm/)
})

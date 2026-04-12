import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'

const COMPONENTS_DIR = path.join(process.cwd(), 'packages', 'ui', 'components')

async function readComponent(relativePath: string) {
  return fs.readFile(path.join(COMPONENTS_DIR, relativePath), 'utf8')
}

test('hero slide card uses framed premium shell treatment with restrained CTA emphasis', async () => {
  const source = await readComponent('HeroSlideCard.tsx')

  assert.match(source, /const HERO_BADGE_BACKGROUND = glass\.badgeWhite/)
  assert.match(source, /const HERO_PANEL_BACKGROUND = colors\.inkBlack/)
  assert.match(source, /backgroundColor: isLead \? colors\.brandPrimary : HERO_BADGE_BACKGROUND/)
  assert.match(source, /backgroundColor: active \? colors\.brandPrimary : colors\.white/)
})

test('flash sale band uses a neutral surface with red reserved for offer emphasis', async () => {
  const source = await readComponent(path.join('home-v2', 'FlashSaleBand.tsx'))

  assert.match(source, /backgroundColor: colors\.surface/)
  assert.match(source, /borderColor: colors\.border/)
  assert.match(source, /color: colors\.brandPrimary/)
})

test('shop catalog filter panel and product card avoid raised shadow-first treatment', async () => {
  const catalogSource = await readComponent(path.join('shop', 'ShopCatalogView.tsx'))
  const productCardSource = await readComponent('ProductCard.tsx')

  assert.match(catalogSource, /<Card radiusKey='xs' variant='flat' style=\{\{ borderWidth: borderWidth\.thin, borderColor: colors\.border \}\}>/)
  assert.match(productCardSource, /boxShadow: 'none'/)
  assert.match(productCardSource, /<Button/)
  assert.match(productCardSource, /variant=\{item\.inStock \? 'primaryCommerce' : 'soft'\}/)
})

test('product card renders sold out state inside the image as a centered bridge label', async () => {
  const source = await readComponent('ProductCard.tsx')

  assert.match(source, /if \(!item\.inStock\) return 'Out of stock'/)
  assert.match(source, /variant=\{item\.inStock \? 'primaryCommerce' : 'soft'\}/)
  assert.match(source, /\{\s*ctaLabel\s*\}/)
})

test('commerce surfaces use RNR-backed control roots for product and cart interactions', async () => {
  const productCardSource = await readComponent('ProductCard.tsx')
  const quickViewSource = await readComponent('QuickViewModal.tsx')
  const cartDrawerSource = await readComponent(path.join('chrome', 'CartDrawer.tsx'))

  assert.match(productCardSource, /import \{ Button as ReusableButton \} from '\.\.\/reusables\/button'/)
  assert.match(productCardSource, /<IconButton/)
  assert.match(quickViewSource, /import \{ Button as ReusableButton \} from '\.\.\/reusables\/button'/)
  assert.match(quickViewSource, /<IconButton/)
  assert.match(cartDrawerSource, /import \{ Button as ReusableButton \} from '\.\.\/\.\.\/reusables\/button'/)
  assert.match(cartDrawerSource, /<IconButton/)
  assert.match(cartDrawerSource, /accessibilityLabel='Decrease quantity'/)
})

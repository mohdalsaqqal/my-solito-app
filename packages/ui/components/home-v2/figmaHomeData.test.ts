import assert from 'node:assert/strict'
import test from 'node:test'
import type { HomeBrandItem, HomeHeroItem, HomeUgcItem } from '../home/types'
import {
  buildDepartmentCards,
  buildEditorialHeroTiles,
  buildTestimonials,
} from './figmaHomeData'

const heroItems: HomeHeroItem[] = [
  {
    id: 'hero-1',
    title: 'Barrier-first skincare that sells',
    subtitle: 'Editorial hero copy',
    ctaLabel: 'Shop now',
    href: '/shop',
    imageUrl: '/hero-1.png',
    badgeLabel: 'Top Offers',
  },
  {
    id: 'hero-2',
    title: 'Weekly luxury edit',
    subtitle: 'Prestige beauty',
    ctaLabel: 'Explore',
    href: '/luxury',
    imageUrl: '/hero-2.png',
    badgeLabel: 'Luxury Edit',
  },
]

const promoBlocks = [
  {
    title: 'Bundle savings',
    subtitle: 'Limited sets',
    ctaLabel: 'Shop bundles',
    href: '/bundles',
    imageUrl: '/promo-1.png',
  },
]

const topBrands: HomeBrandItem[] = [
  { id: 'brand-1', name: 'Cleansers' },
  { id: 'brand-2', name: 'Sunscreen' },
]

const tickerItems = [
  { id: 'tick-1', label: 'Masks' },
  { id: 'tick-2', label: 'Eye Care' },
]

const ugcItems: HomeUgcItem[] = [
  {
    id: 'ugc-1',
    imageUrl: '/ugc-1.png',
    caption: 'My skin feels balanced after one week.',
  },
]

test('buildEditorialHeroTiles composes hero items and promo blocks into a stable hero rail', () => {
  const tiles = buildEditorialHeroTiles(heroItems, promoBlocks)

  assert.equal(tiles.length, 3)
  assert.equal(tiles[0]?.title, 'Barrier-first skincare that sells')
  assert.equal(tiles[0]?.badge, 'Top Offers')
  assert.equal(tiles[2]?.ctaLabel, 'Shop bundles')
  assert.equal(tiles[2]?.eyebrow, 'Editorial Pick')
})

test('buildDepartmentCards derives five department chips with fallback labels when source data is sparse', () => {
  const cards = buildDepartmentCards(topBrands, tickerItems)

  assert.equal(cards.length, 5)
  assert.deepEqual(
    cards.map((card) => card.label),
    ['Cleansers', 'Sunscreen', 'Masks', 'Eye Care', 'Moisturizers'],
  )
})

test('buildTestimonials prefers ugc captions and pads with editorial fallbacks', () => {
  const cards = buildTestimonials(ugcItems)

  assert.equal(cards.length, 2)
  assert.equal(cards[0]?.quote, 'My skin feels balanced after one week.')
  assert.equal(cards[0]?.imageUrl, '/ugc-1.png')
  assert.equal(cards[1]?.name, 'Courtney Henry')
})

import type { HomeBrandItem, HomeHeroItem, HomeUgcItem } from '../home/types'

export type PromoBlock = {
  title: string
  subtitle?: string
  ctaLabel?: string
  href?: string
  imageUrl?: string
}

export type EditorialHeroTile = {
  id: string
  badge: string
  eyebrow: string
  title: string
  subtitle?: string
  ctaLabel?: string
  href?: string
  imageUrl?: string
  panelColor?: string
  tone: 'flash' | 'editorial' | 'new' | 'luxury' | 'member'
}

export type DepartmentCard = {
  id: string
  label: string
}

export type TestimonialCard = {
  id: string
  name: string
  role: string
  quote: string
  imageUrl?: string
}

const HERO_TONES: EditorialHeroTile['tone'][] = ['flash', 'editorial', 'new', 'luxury', 'member']

const HERO_PRESENTATION_DEFAULTS: Record<
  EditorialHeroTile['tone'],
  { badge: string; eyebrow: string; cta: string }
> = {
  flash: {
    badge: 'Top Offers',
    eyebrow: 'Department Deals',
    cta: 'See all deals',
  },
  editorial: {
    badge: 'Routine Notes',
    eyebrow: 'Editorial Pick',
    cta: 'Explore the edit',
  },
  new: {
    badge: 'New In',
    eyebrow: 'Now Arriving',
    cta: 'Shop new arrivals',
  },
  luxury: {
    badge: 'Prestige Hall',
    eyebrow: 'Luxury Edit',
    cta: 'Enter prestige',
  },
  member: {
    badge: 'Member Value',
    eyebrow: 'Benefits + Bundles',
    cta: 'Unlock offers',
  },
}

const DEFAULT_DEPARTMENTS = [
  'Cleansers',
  'Sunscreen',
  'Masks',
  'Eye Care',
  'Moisturizers',
]

const DEFAULT_TESTIMONIALS: TestimonialCard[] = [
  {
    id: 'review-1',
    name: 'Jane Cooper',
    role: 'Customer',
    quote:
      'Any of conscious skincare products in mature range can help in cold months. They are called moisturizers, but that is an understatement!',
    imageUrl: undefined,
  },
  {
    id: 'review-2',
    name: 'Courtney Henry',
    role: 'Customer',
    quote:
      'I had severe skin irritation from a product and this care routine changed the game. My skin now feels soft and balanced.',
    imageUrl: undefined,
  },
]

function toEyebrow(value?: string) {
  if (!value) {
    return 'Editorial Pick'
  }
  return value.length > 24 ? value.slice(0, 24).trim() : value
}

function cleanHeroSubtitle(value?: string) {
  if (!value) return undefined
  const cleaned = value.trim().replace(/^[^•]{1,24}\s*•\s*/, '').trim()
  return cleaned.length > 0 ? cleaned : value.trim()
}

export function buildEditorialHeroTiles(
  heroItems: HomeHeroItem[],
  promoBlocks: PromoBlock[],
): EditorialHeroTile[] {
  const heroTiles: EditorialHeroTile[] = heroItems.map((item, index) => {
    const tone = HERO_TONES[index % HERO_TONES.length] ?? 'editorial'
    const defaults = HERO_PRESENTATION_DEFAULTS[tone]

    return {
      id: item.id,
      badge: defaults.badge,
      eyebrow: defaults.eyebrow || toEyebrow(item.badgeLabel),
      title: item.title,
      subtitle: cleanHeroSubtitle(item.subtitle),
      ctaLabel: item.ctaLabel?.trim() || defaults.cta,
      href: item.href,
      imageUrl: item.imageUrl,
      panelColor: item.panelColor,
      tone,
    }
  })

  const promoItems: EditorialHeroTile[] = promoBlocks.map((block, index) => {
    const tone = HERO_TONES[(heroItems.length + index) % HERO_TONES.length] ?? 'editorial'
    const defaults = HERO_PRESENTATION_DEFAULTS[tone]

    return {
      id: `promo-${index + 1}`,
      badge: defaults.badge,
      eyebrow: defaults.eyebrow,
      title: block.title,
      subtitle: cleanHeroSubtitle(block.subtitle),
      ctaLabel: block.ctaLabel?.trim() || defaults.cta,
      href: block.href,
      imageUrl: block.imageUrl,
      tone,
    }
  })

  return [...heroTiles, ...promoItems]
}

export function buildDepartmentCards(
  topBrands: HomeBrandItem[],
  tickerItems: Array<{ id: string; label: string }>,
): DepartmentCard[] {
  const seen = new Set<string>()
  const labels = [...topBrands.map((item) => item.name), ...tickerItems.map((item) => item.label), ...DEFAULT_DEPARTMENTS]
    .map((value) => value.trim())
    .filter(Boolean)
    .filter((value) => {
      const normalized = value.toLowerCase()
      if (seen.has(normalized)) {
        return false
      }
      seen.add(normalized)
      return true
    })

  return labels.slice(0, 5).map((label, index) => ({
    id: `department-${index + 1}`,
    label,
  }))
}

export function buildTestimonials(ugcItems: HomeUgcItem[]): TestimonialCard[] {
  const derived = ugcItems
    .filter((item) => item.caption && item.caption.trim().length > 0)
    .slice(0, 2)
    .map((item, index) => ({
      id: item.id,
      name: index === 0 ? 'Jane Cooper' : 'Courtney Henry',
      role: 'Customer',
      quote: item.caption!.trim(),
      imageUrl: item.imageUrl,
    }))

  return [...derived, ...DEFAULT_TESTIMONIALS.slice(derived.length)].slice(0, 2)
}

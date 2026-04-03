import { HeroTileRail } from '@real/ui/components'
import { resolvePairString } from '../../../sections/blocks/block-types'
import type { HomeHeroItem } from '@real/ui/components/home/types'
import type { IndependentRenderSlot } from '../home-types'

type Props = {
  slot: IndependentRenderSlot
  onNavigate?: (href: string) => void
}

function mapHeroItems(block: IndependentRenderSlot['block']): HomeHeroItem[] {
  if (block.type !== 'hero_carousel' && block.type !== 'hero') return []
  const cards = block.type === 'hero_carousel'
    ? (block.cardsLocalized ?? block.cards)
    : (block.items ?? [])
  return cards.map((card: any) => ({
    id: card.id,
    title: 'titleText' in card && card.titleText
      ? card.titleText
      : resolvePairString(block.locale, card.titleEn, card.titleAr),
    subtitle: 'subtitleText' in card && card.subtitleText
      ? card.subtitleText
      : resolvePairString(block.locale, card.subtitleEn, card.subtitleAr),
    ctaLabel: 'ctaText' in card && card.ctaText
      ? card.ctaText
      : resolvePairString(block.locale, card.ctaLabelEn, card.ctaLabelAr),
    badgeLabel: 'badgeText' in card && card.badgeText
      ? card.badgeText
      : resolvePairString(block.locale, card.badgeLabelEn, card.badgeLabelAr),
    href: card.href,
    imageUrl: card.imageUrl,
  }))
}

export function renderHeroBlock({ slot, onNavigate }: Props) {
  const { block } = slot
  if (block.type !== 'hero_carousel' && block.type !== 'hero') return null

  const items = mapHeroItems(block)
  if (items.length === 0) return null

  const autoplay = block.type === 'hero_carousel' && block.autoplayMs > 0
  const autoplayMs = block.type === 'hero_carousel' ? block.autoplayMs : undefined

  return (
    <HeroTileRail
      heroItems={items}
      promoBlocks={[]}
      autoplay={autoplay}
      autoplayMs={autoplayMs}
      onNavigate={onNavigate}
    />
  )
}

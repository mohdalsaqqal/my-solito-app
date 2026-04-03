import { OfferBannersGrid } from '@real/ui/components'
import type { OfferBannerBlock } from '@real/ui/components'
import { resolveBlockString, resolvePairString } from '../../../sections/blocks/block-types'
import type { IndependentRenderSlot } from '../home-types'

type Props = {
  slot: IndependentRenderSlot
  isDesktop: boolean
  onNavigate?: (href: string) => void
}

function mapOfferBannerBlocks(
  locale: 'en' | 'ar',
  items: Array<{ id: string; title?: string; subtitle?: string; ctaLabel?: string; href?: string; imageUrl?: string }>,
): OfferBannerBlock[] {
  return items.map((item) => ({
    id: item.id,
    title: item.title ?? '',
    subtitle: item.subtitle,
    ctaLabel: item.ctaLabel,
    href: item.href,
    imageUrl: item.imageUrl,
  }))
}

export function renderOfferBannersBlock({ slot, isDesktop, onNavigate }: Props) {
  const { block } = slot

  if (block.type === 'offer_banners') {
    return (
      <OfferBannersGrid
        title={block.titleText}
        blocks={mapOfferBannerBlocks(block.locale, block.itemsLocalized ?? block.items)}
        isDesktop={isDesktop}
        onNavigate={onNavigate}
      />
    )
  }

  if (block.type === 'education_banner') {
    return (
      <OfferBannersGrid
        title={block.titleText ?? resolvePairString(block.locale, block.titleEn, block.titleAr, '')}
        blocks={mapOfferBannerBlocks(block.locale, [{
          id: block.id,
          title: block.titleText ?? '',
          subtitle: block.subtitleText,
          ctaLabel: block.ctaText,
          href: block.href,
          imageUrl: block.imageUrl,
        }])}
        isDesktop={isDesktop}
        onNavigate={onNavigate}
      />
    )
  }

  if (block.type === 'offer_stack' || block.type === 'sticky_listing_promo') {
    return (
      <OfferBannersGrid
        blocks={mapOfferBannerBlocks(
          block.locale,
          block.type === 'sticky_listing_promo'
            ? [{ id: block.id, title: resolveBlockString(block.locale, block.title, ''), subtitle: resolveBlockString(block.locale, block.subtitle), href: block.href }]
            : block.items.map((item) => ({ id: item.id, title: resolveBlockString(block.locale, item.title, ''), subtitle: resolveBlockString(block.locale, item.subtitle), ctaLabel: resolveBlockString(block.locale, item.badge), href: item.href })),
        )}
        isDesktop={isDesktop}
        onNavigate={onNavigate}
      />
    )
  }

  return null
}

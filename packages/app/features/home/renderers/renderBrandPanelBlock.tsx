import { BrandSpotlightPanel } from '@real/ui/components'
import { mapBrandItems } from '../../../sections/blocks/block-types'
import type { IndependentRenderSlot } from '../home-types'

type Props = {
  slot: IndependentRenderSlot
  onNavigate?: (href: string) => void
}

/**
 * Renders brand_spotlight blocks using BrandSpotlightPanel — the two-column
 * layout with a showcase image on the left and a brand grid on the right.
 * Used on desktop as an alternative to the BrandSpotlightSection product rail.
 */
export function renderBrandPanelBlock({ slot, onNavigate }: Props) {
  const { block, profile } = slot

  if (block.type !== 'brand_spotlight') return null

  const isDesktop = profile.breakpoint === 'desktop'
  const locale = block.locale ?? 'en'

  const brands = mapBrandItems(
    (block.items ?? []).map((item: any) => ({
      id: item.id,
      name: item.name ?? '',
      href: item.href,
      logoUrl: item.logoUrl,
    }))
  )

  if (brands.length === 0) return null

  const featureTitle = block.titleText
    ?? (locale === 'ar' ? block.bannerTitleAr : block.bannerTitleEn)
  const featureSubtitle = locale === 'ar' ? block.bannerSubtitleAr : block.bannerSubtitleEn
  const featureCtaLabel = block.ctaText
    ?? (locale === 'ar' ? block.bannerCtaLabelAr : block.bannerCtaLabelEn)

  return (
    <BrandSpotlightPanel
      showcaseImageUrl={block.bannerImageUrl}
      featureTitle={featureTitle}
      featureSubtitle={featureSubtitle}
      featureCtaLabel={featureCtaLabel}
      featureHref={block.bannerHref}
      brands={brands}
      isDesktop={isDesktop}
      onNavigate={onNavigate}
    />
  )
}

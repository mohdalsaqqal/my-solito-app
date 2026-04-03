import { BrandSpotlightSection } from '@real/ui/components'
import { resolveBlockString, resolvePairString, mapProductsToProductCardModels } from '../../../sections/blocks/block-types'
import type { IndependentRenderSlot } from '../home-types'

type Props = {
  slot: IndependentRenderSlot
  loading: boolean
  error: string | null
  railAutoplayMs?: number
  onReload: () => void
  onNavigate?: (href: string) => void
  onSelectProduct?: (productId: string) => void
  onAddToCart?: (productId: string) => void
}

export function renderBrandSpotlightBlock({ slot, loading, error, railAutoplayMs = 5200, onReload, onNavigate, onSelectProduct, onAddToCart }: Props) {
  const { block } = slot
  if (block.type !== 'brand_spotlight' && block.type !== 'brand_promo') return null
  const items = mapProductsToProductCardModels(block.products ?? [], block.locale)
  return (
    <BrandSpotlightSection
      id={block.id}
      bannerTitle={
        block.type === 'brand_spotlight'
          ? block.titleText ?? resolvePairString(block.locale, block.bannerTitleEn, block.bannerTitleAr, '')
          : resolveBlockString(block.locale, block.title, '')
      }
      bannerSubtitle={
        block.type === 'brand_spotlight'
          ? resolvePairString(block.locale, block.bannerSubtitleEn, block.bannerSubtitleAr)
          : resolveBlockString(block.locale, block.subtitle)
      }
      bannerCtaLabel={
        block.type === 'brand_spotlight'
          ? block.ctaText ?? resolvePairString(block.locale, block.bannerCtaLabelEn, block.bannerCtaLabelAr, '')
          : resolveBlockString(block.locale, block.ctaLabel)
      }
      bannerHref={block.type === 'brand_spotlight' ? block.bannerHref : block.href}
      bannerImageUrl={block.type === 'brand_spotlight' ? block.bannerImageUrl : block.imageUrl}
      railTitle={
        block.type === 'brand_spotlight'
          ? resolvePairString(block.locale, block.railTitleEn, block.railTitleAr, '')
          : block.titleText ?? resolveBlockString(block.locale, block.title, '')
      }
      items={items}
      autoplay
      autoplayMs={railAutoplayMs}
      loading={loading}
      error={error}
      onRetry={onReload}
      onPressBanner={(href) => (href ? onNavigate?.(href) : undefined)}
      onPressProduct={(item) => onSelectProduct?.(item.id)}
      onAddToCart={(item) => onAddToCart?.(item.id)}
    />
  )
}

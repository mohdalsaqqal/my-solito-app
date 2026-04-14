import { spacing } from '@real/tokens'
import { Box } from '../../primitives'
import type { ProductCardModel } from '../ProductCard.types'
import { BestItemsMonthRail } from './BestItemsMonthRail'
import { BrandStoryBanner } from './BrandStoryBanner'

type BrandSpotlightSectionProps = {
  id: string
  bannerTitle: string
  bannerSubtitle?: string
  bannerCtaLabel?: string
  bannerHref?: string
  bannerImageUrl?: string
  railTitle: string
  items: ProductCardModel[]
  autoplay?: boolean
  autoplayMs?: number
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  onPressBanner?: (href?: string) => void
  onPressProduct?: (item: ProductCardModel) => void
  onAddToCart?: (item: ProductCardModel) => void
}

export function BrandSpotlightSection({
  id,
  bannerTitle,
  bannerSubtitle,
  bannerCtaLabel,
  bannerHref,
  bannerImageUrl,
  railTitle,
  items,
  autoplay = false,
  autoplayMs = 4200,
  loading = false,
  error,
  onRetry,
  onPressBanner,
  onPressProduct,
  onAddToCart,
}: BrandSpotlightSectionProps) {
  return (
    <Box key={id} data-ect-node="BrandSpotlightSection" style={{ gap: spacing.space4 }}>
      <BrandStoryBanner
        title={bannerTitle}
        subtitle={bannerSubtitle}
        ctaLabel={bannerCtaLabel}
        href={bannerHref}
        imageUrl={bannerImageUrl}
        onPress={onPressBanner}
      />
      {items.length > 0 ? (
        <BestItemsMonthRail
          title={railTitle}
          items={items}
          autoplay={autoplay}
          autoplayMs={autoplayMs}
          loading={loading}
          error={error}
          onRetry={onRetry}
          onPressProduct={onPressProduct}
          onAddToCart={onAddToCart}
        />
      ) : null}
    </Box>
  )
}

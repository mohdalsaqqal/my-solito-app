import { spacing } from '@real/tokens'
import { Box } from '../../primitives'
import { HomeProductItem } from '../home/types'
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
  items: HomeProductItem[]
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  onPressBanner?: (href?: string) => void
  onPressProduct?: (item: HomeProductItem) => void
  onAddToCart?: (item: HomeProductItem) => void
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
  loading = false,
  error,
  onRetry,
  onPressBanner,
  onPressProduct,
  onAddToCart,
}: BrandSpotlightSectionProps) {
  return (
    <Box key={id} style={{ gap: spacing['16'] }}>
      <BrandStoryBanner
        title={bannerTitle}
        subtitle={bannerSubtitle}
        ctaLabel={bannerCtaLabel}
        href={bannerHref}
        imageUrl={bannerImageUrl}
        onPress={onPressBanner}
      />
      {items.length >= 3 ? (
        <BestItemsMonthRail
          title={railTitle}
          items={items}
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

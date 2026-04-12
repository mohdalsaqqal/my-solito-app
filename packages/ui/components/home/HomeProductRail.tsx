import { spacing } from '@real/tokens'
import { Box } from '../../primitives'
import { HorizontalRailState } from '../HorizontalRailState'
import { MarketplaceSectionHeader } from '../MarketplaceSectionHeader'
import { ProductCard, ProductCardSkeleton } from '../ProductCard'
import type { ProductCardModel } from '../ProductCard.types'

type HomeProductRailProps = {
  title: string
  items: ProductCardModel[]
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  onPressViewAll?: () => void
  onPressProduct?: (item: ProductCardModel) => void
  onAddToCart?: (item: ProductCardModel) => void
}

export function HomeProductRail({
  title,
  items,
  loading = false,
  error,
  onRetry,
  onPressViewAll,
  onPressProduct,
  onAddToCart,
}: HomeProductRailProps) {
  const sectionKey = title.toLowerCase()
  const isFlash = sectionKey.includes('flash')
  const isTrending = sectionKey.includes('best') || sectionKey.includes('new')
  const sectionSubtitle = isFlash
    ? 'Curated discounts ending soon'
    : isTrending
      ? 'Active picks'
      : undefined
  const urgencyLabel = isFlash ? 'Ends soon' : isTrending ? 'Popular now' : undefined
  const cardWidth = spacing.xxl * 5

  return (
    <Box style={{ gap: spacing['8'], paddingTop: spacing['4'] }}>
      <MarketplaceSectionHeader
        title={title}
        eyebrow={urgencyLabel}
        meta={sectionSubtitle}
        actionLabel='View all'
        onPressAction={onPressViewAll}
      />

      <HorizontalRailState
        loading={loading}
        error={error}
        isEmpty={items.length === 0}
        onRetry={onRetry}
        emptyMessage='No products available right now.'
        loadingCount={4}
        loadingItem={(key) => <ProductCardSkeleton key={key} width={cardWidth} variant='compact' />}
      >
        <>
          {items.map((item) => (
            <ProductCard
              key={item.id}
              item={item}
              width={cardWidth}
              variant='compact'
              onPress={() => onPressProduct?.(item)}
              onPressAdd={() => onAddToCart?.(item)}
            />
          ))}
        </>
      </HorizontalRailState>
    </Box>
  )
}

import { fontFamilies, grid, spacing } from '@real/tokens'
import { Box, Text } from '../../primitives'
import { HorizontalRailState } from '../HorizontalRailState'
import { ProductCard, ProductCardSkeleton } from '../ProductCard'
import type { ProductCardModel } from '../ProductCard.types'

type BundlePromotionsRailProps = {
  title: string
  items: ProductCardModel[]
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  onPressProduct?: (item: ProductCardModel) => void
  onAddToCart?: (item: ProductCardModel) => void
}

export function BundlePromotionsRail({
  title,
  items,
  loading = false,
  error,
  onRetry,
  onPressProduct,
  onAddToCart,
}: BundlePromotionsRailProps) {
  const baseCardWidth = spacing.xxl * 5
  const bundleCardWidth = baseCardWidth * grid.bundleCardWidthMultiplier

  return (
    <Box style={{ gap: spacing['16'] }}>
      <Box align='center' style={{ paddingBottom: spacing['8'] }}>
        <Text variant='h2' style={{ fontFamily: fontFamilies.serif, letterSpacing: -0.3 }}>{title}</Text>
      </Box>

      <HorizontalRailState
        loading={loading}
        error={error}
        isEmpty={items.length === 0}
        onRetry={onRetry}
        emptyMessage='No bundles available right now.'
        loadingCount={3}
        loadingItem={(key) => <ProductCardSkeleton key={key} width={bundleCardWidth} variant='featured' />}
      >
        <>
          {items.map((item) => (
            <ProductCard
              key={item.id}
              item={item}
              variant='featured'
              width={bundleCardWidth}
              onPress={() => onPressProduct?.(item)}
              onPressAdd={() => onAddToCart?.(item)}
            />
          ))}
        </>
      </HorizontalRailState>
    </Box>
  )
}

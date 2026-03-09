import { grid, spacing } from '@real/tokens'
import { Box, Text } from '../../primitives'
import { HorizontalRailState } from '../HorizontalRailState'
import { ProductCard } from '../ProductCard'
import { HomeProductItem } from '../home/types'

type BundlePromotionsRailProps = {
  title: string
  items: HomeProductItem[]
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  onPressProduct?: (item: HomeProductItem) => void
  onAddToCart?: (item: HomeProductItem) => void
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
        <Text variant='h2'>{title}</Text>
      </Box>

      <HorizontalRailState
        loading={loading}
        error={error}
        isEmpty={items.length === 0}
        onRetry={onRetry}
        emptyMessage='No bundles available right now.'
        loadingCount={3}
        loadingItem={(key) => <ProductCard key={key} state='loading' width={bundleCardWidth} />}
      >
        <>
          {items.map((item) => (
            <ProductCard
              key={item.id}
              item={item}
              variant='bundle'
              width={bundleCardWidth}
              onPress={onPressProduct}
              onAddToCart={onAddToCart}
              savingsLabel='Save 15%'
            />
          ))}
        </>
      </HorizontalRailState>
    </Box>
  )
}

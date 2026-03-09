import { spacing } from '@real/tokens'
import { Box, Text } from '../../primitives'
import { HorizontalRailState } from '../HorizontalRailState'
import { ProductCard } from '../ProductCard'
import { HomeProductItem } from '../home/types'

type BestItemsMonthRailProps = {
  title?: string
  items: HomeProductItem[]
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  onPressProduct?: (item: HomeProductItem) => void
  onAddToCart?: (item: HomeProductItem) => void
}

export function BestItemsMonthRail({
  title = 'Best Items for This Month',
  items,
  loading = false,
  error,
  onRetry,
  onPressProduct,
  onAddToCart,
}: BestItemsMonthRailProps) {
  const cardWidth = spacing.xxl * 5

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
        emptyMessage='No products available right now.'
        loadingCount={4}
        loadingItem={(key) => <ProductCard key={key} state='loading' width={cardWidth} />}
      >
        <>
          {items.map((item) => (
            <ProductCard
              key={item.id}
              item={item}
              width={cardWidth}
              onPress={onPressProduct}
              onAddToCart={onAddToCart}
            />
          ))}
        </>
      </HorizontalRailState>
    </Box>
  )
}

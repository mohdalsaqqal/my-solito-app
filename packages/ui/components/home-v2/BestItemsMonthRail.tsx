import { spacing } from '@real/tokens'
import { Box, Text } from '../../primitives'
import { HorizontalRailState } from '../HorizontalRailState'
import { ProductCard, ProductCardSkeleton } from '../ProductCard'
import type { ProductCardModel } from '../ProductCard.types'

type BestItemsMonthRailProps = {
  title?: string
  items: ProductCardModel[]
  autoplay?: boolean
  autoplayMs?: number
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  onPressProduct?: (item: ProductCardModel) => void
  onAddToCart?: (item: ProductCardModel) => void
}

export function BestItemsMonthRail({
  title = 'Best Items for This Month',
  items,
  autoplay = false,
  autoplayMs = 4200,
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
        autoplay={autoplay}
        autoplayMs={autoplayMs}
        itemCount={items.length}
        stepDistance={cardWidth + spacing.xs}
        onRetry={onRetry}
        emptyMessage='No products available right now.'
        loadingCount={4}
        loadingItem={(key) => <ProductCardSkeleton key={key} width={cardWidth} />}
      >
        <>
          {items.map((item) => (
            <ProductCard
              key={item.id}
              item={item}
              width={cardWidth}
              onPress={() => onPressProduct?.(item)}
              onPressAdd={() => onAddToCart?.(item)}
            />
          ))}
        </>
      </HorizontalRailState>
    </Box>
  )
}

import { borderWidth, colors, spacing } from '@real/tokens'
import { Box, Text, Touchable } from '../../primitives'
import { HorizontalRailState } from '../HorizontalRailState'
import { ProductCard } from '../ProductCard'
import { HomeProductItem } from './types'

type HomeProductRailProps = {
  title: string
  items: HomeProductItem[]
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  onPressViewAll?: () => void
  onPressProduct?: (item: HomeProductItem) => void
  onAddToCart?: (item: HomeProductItem) => void
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
    <Box
      style={{
        gap: spacing.sm,
        padding: spacing.sm,
        borderWidth: isFlash ? borderWidth.thick : borderWidth.thin,
        borderColor: isFlash ? colors.primary : colors.border,
        backgroundColor: isFlash ? colors.brandPrimarySubtle : colors.surface,
      }}
    >
      <Box style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <Box style={{ gap: spacing.xs }}>
          {urgencyLabel ? (
            <Box
              style={{
                alignSelf: 'flex-start',
                borderWidth: isFlash ? borderWidth.thick : borderWidth.thin,
                borderColor: colors.primary,
                backgroundColor: isFlash ? colors.primary : colors.surface,
                paddingHorizontal: spacing.xs,
                paddingVertical: spacing.xxs,
              }}
            >
              <Text variant='caption' tone={isFlash ? 'inverse' : 'danger'} style={{ textTransform: 'uppercase' }}>
                {urgencyLabel}
              </Text>
            </Box>
          ) : null}
          <Text variant='title'>{title}</Text>
          {sectionSubtitle ? (
            <Text variant='caption' tone={isFlash ? 'danger' : 'muted'} style={{ textTransform: 'uppercase' }}>
              {sectionSubtitle}
            </Text>
          ) : null}
        </Box>
        <Touchable onPress={onPressViewAll}>
          <Text variant='label' tone='primary' style={{ textTransform: 'uppercase' }}>
            View all
          </Text>
        </Touchable>
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
              contentPadding='md'
              onPress={onPressProduct}
              onAddToCart={onAddToCart}
            />
          ))}
        </>
      </HorizontalRailState>
    </Box>
  )
}

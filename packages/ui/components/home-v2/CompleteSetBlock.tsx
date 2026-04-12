import { spacing } from '@real/tokens'
import { Box, Text } from '../../primitives'
import { Button } from '../Button'
import { HorizontalRailState } from '../HorizontalRailState'
import { ProductCard, ProductCardSkeleton } from '../ProductCard'
import type { ProductCardModel } from '../ProductCard.types'

type CompleteSetBlockProps = {
  title: string
  subtitle?: string
  ctaLabel?: string
  items: ProductCardModel[]
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  onPressCta?: () => void
  onPressProduct?: (item: ProductCardModel) => void
  onAddToCart?: (item: ProductCardModel) => void
}

export function CompleteSetBlock({
  title,
  subtitle,
  ctaLabel,
  items,
  loading = false,
  error,
  onRetry,
  onPressCta,
  onPressProduct,
  onAddToCart,
}: CompleteSetBlockProps) {
  return (
    <Box style={{ gap: spacing['24'] }}>
      <Box style={{ gap: spacing.xs, alignItems: 'center' }}>
        <Text variant='headline'>{title}</Text>
        {subtitle ? <Text tone='muted' variant='bodySm'>{subtitle}</Text> : null}
        {ctaLabel ? (
          <Box style={{ width: spacing.xxl * 3 }}>
            <Button variant='outline' onPress={onPressCta}>
              {ctaLabel}
            </Button>
          </Box>
        ) : null}
      </Box>

      <HorizontalRailState
        loading={loading}
        error={error}
        isEmpty={items.length === 0}
        onRetry={onRetry}
        emptyMessage='No complete set items available right now.'
        loadingCount={3}
        loadingItem={(key) => <ProductCardSkeleton key={key} width={spacing.xxl * 6} variant='featured' />}
      >
        <>
          {items.map((item) => (
            <ProductCard
              key={item.id}
              item={item}
              variant='featured'
              width={spacing.xxl * 6}
              onPress={() => onPressProduct?.(item)}
              onPressAdd={() => onAddToCart?.(item)}
            />
          ))}
        </>
      </HorizontalRailState>
    </Box>
  )
}

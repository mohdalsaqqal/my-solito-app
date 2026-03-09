import { spacing } from '@real/tokens'
import { Box, Text } from '../../primitives'
import { Button } from '../Button'
import { HorizontalRailState } from '../HorizontalRailState'
import { ProductCard } from '../ProductCard'
import { HomeProductItem } from '../home/types'

type CompleteSetBlockProps = {
  title: string
  subtitle?: string
  ctaLabel?: string
  items: HomeProductItem[]
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  onPressCta?: () => void
  onPressProduct?: (item: HomeProductItem) => void
  onAddToCart?: (item: HomeProductItem) => void
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
        loadingItem={(key) => <ProductCard key={key} state='loading' width={spacing.xxl * 6} />}
      >
        <>
          {items.map((item) => (
            <ProductCard
              key={item.id}
              item={item}
              width={spacing.xxl * 6}
              onPress={onPressProduct}
              onAddToCart={onAddToCart}
            />
          ))}
        </>
      </HorizontalRailState>
    </Box>
  )
}

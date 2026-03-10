import { View, ViewStyle } from 'react-native'
import { spacing } from '@real/tokens'
import { Text } from '../primitives/Text'
import { Skeleton } from './Skeleton'

type PriceTagProps = {
  price: number
  compareAt?: number
  currency?: string
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  style?: ViewStyle
}

// Text variant map — adjusted to actual variants: 'bodySm' | 'body' | 'title'
const priceTextVariant = {
  sm: 'bodySm',
  md: 'body',
  lg: 'title',
} as const

// Compare-at (strikethrough) variant is one step smaller than the main price variant
const compareAtTextVariant = {
  sm: 'bodySm',
  md: 'bodySm',
  lg: 'body',
} as const

function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function PriceTag({
  price,
  compareAt,
  currency = 'SAR',
  size = 'md',
  loading = false,
  disabled = false,
  style,
}: PriceTagProps) {
  const isSale = compareAt !== undefined && compareAt > price

  if (loading) {
    return (
      <View style={[{ flexDirection: 'row', gap: spacing.xs, alignItems: 'center' }, style]}>
        <Skeleton width={64} height={20} radius="md" />
        {compareAt !== undefined && (
          <Skeleton width={48} height={16} radius="md" />
        )}
      </View>
    )
  }

  return (
    <View
      style={[
        { flexDirection: 'row', gap: spacing.xs, alignItems: 'center', flexWrap: 'wrap' },
        style,
      ]}
      accessibilityLabel={
        isSale
          ? `Sale price ${formatPrice(price, currency)}, was ${formatPrice(compareAt!, currency)}`
          : `Price ${formatPrice(price, currency)}`
      }
      accessibilityRole="text"
    >
      <Text
        variant={priceTextVariant[size]}
        tone={isSale ? 'danger' : disabled ? 'muted' : 'default'}
        weight="700"
      >
        {formatPrice(price, currency)}
      </Text>

      {isSale && compareAt !== undefined && (
        <Text
          variant={compareAtTextVariant[size]}
          tone="muted"
          style={{ textDecorationLine: 'line-through' }}
        >
          {formatPrice(compareAt, currency)}
        </Text>
      )}
    </View>
  )
}

import { View } from 'react-native'
import { colors, spacing } from '@real/tokens'
import { Text } from '../primitives'

const REVIEW_COUNT_FORMATTER = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })

type StarRatingProps = {
  value: number
  max?: number
  size?: number
  reviewCount?: number | null
  color?: string
}

export function StarRating({
  value,
  max = 5,
  size = 12,
  reviewCount,
  color,
}: StarRatingProps) {
  const resolvedColor = color ?? colors.warning
  const clamped = Math.max(0, Math.min(max, value))
  const formattedValue = clamped.toFixed(1)
  const formattedReviewCount =
    reviewCount != null
      ? REVIEW_COUNT_FORMATTER.format(reviewCount)
      : null
  const accessibilityLabel =
    reviewCount != null
      ? `Rated ${formattedValue} out of ${max} stars from ${formattedReviewCount} reviews`
      : `Rated ${formattedValue} out of ${max} stars`

  return (
    <View
      style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['4'] }}
      accessible={true}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole='text'
    >
      <View
        style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}
        accessible={false}
        importantForAccessibility='no-hide-descendants'
      >
        {Array.from({ length: max }, (_, i) => {
          const filled = i < Math.floor(clamped)
          const partial =
            !filled && i === Math.floor(clamped) ? clamped - Math.floor(clamped) : 0
          const char = filled ? '★' : partial >= 0.5 ? '⯨' : '☆'

          return (
            <Text
              key={i}
              style={{
                fontSize: size,
                color: resolvedColor,
                lineHeight: size + 2,
              }}
              accessible={false}
            >
              {char}
            </Text>
          )
        })}
      </View>

      <Text
        variant='caption'
        tone='muted'
        weight='500'
        accessible={false}
        importantForAccessibility='no'
      >
        {formattedValue}
      </Text>

      {reviewCount != null && (
        <Text
          variant='caption'
          tone='muted'
          accessible={false}
          importantForAccessibility='no'
        >
          {`${formattedReviewCount} ${reviewCount === 1 ? 'review' : 'reviews'}`}
        </Text>
      )}
    </View>
  )
}

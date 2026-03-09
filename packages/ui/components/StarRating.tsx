import { Platform, View } from 'react-native'
import { colors, spacing } from '@real/tokens'
import { Text } from '../primitives'

type StarRatingProps = {
  value: number
  max?: number
  size?: number
  reviewCount?: number | null
  color?: string
}

// SVG star — web only, rendered inline
function WebStar({
  filled,
  partial,
  size,
  color,
  index,
}: {
  filled: boolean
  partial: number
  size: number
  color: string
  index: number
}) {
  const clipId = `star-clip-${index}`
  const path =
    'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z'

  return (
    // @ts-ignore — SVG is web-only, TS doesn't know about svg JSX here
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={{ display: 'block', flexShrink: 0 }}
    >
      {partial > 0 && partial < 1 && (
        // @ts-ignore
        <defs>
          {/* @ts-ignore */}
          <clipPath id={clipId}>
            {/* @ts-ignore */}
            <rect x="0" y="0" width={24 * partial} height="24" />
          </clipPath>
        </defs>
      )}
      {/* Empty star outline */}
      {/* @ts-ignore */}
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" opacity={0.3} />
      {/* Filled portion */}
      {(filled || partial > 0) && (
        // @ts-ignore
        <path
          d={path}
          fill={color}
          clipPath={partial > 0 && partial < 1 ? `url(#${clipId})` : undefined}
        />
      )}
    </svg>
  )
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
  const accessibilityLabel =
    reviewCount != null
      ? `Rated ${clamped.toFixed(1)} out of ${max} stars from ${reviewCount} reviews`
      : `Rated ${clamped.toFixed(1)} out of ${max} stars`

  return (
    <View
      style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}
      accessible={true}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="text"
    >
      {/* Stars row — hidden from a11y tree; parent carries the label */}
      <View
        style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}
        accessible={false}
        importantForAccessibility="no-hide-descendants"
      >
        {Array.from({ length: max }, (_, i) => {
          const filled = i < Math.floor(clamped)
          const partial =
            !filled && i === Math.floor(clamped) ? clamped - Math.floor(clamped) : 0

          if (Platform.OS === 'web') {
            return (
              <WebStar
                key={i}
                index={i}
                filled={filled}
                partial={partial}
                size={size}
                color={resolvedColor}
              />
            )
          }

          // Native: unicode chars — visually OK, a11y handled by parent label
          const char = filled ? '★' : partial >= 0.5 ? '⯨' : '☆'
          return (
            <Text
              key={i}
              style={{ fontSize: size, color: resolvedColor, lineHeight: size + 2 }}
              accessible={false}
            >
              {char}
            </Text>
          )
        })}
      </View>

      {reviewCount != null && (
        <Text
          variant="caption"
          tone="muted"
          accessible={false}
          importantForAccessibility="no"
        >
          ({reviewCount})
        </Text>
      )}
    </View>
  )
}

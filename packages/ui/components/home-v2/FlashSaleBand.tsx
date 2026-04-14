import { colors, fontWeights, letterSpacing, spacing, typography } from '@real/tokens'
import { Box, Text } from '../../primitives'
import { CountdownTimer } from './CountdownTimer'
import { useThemeColors } from '../../responsive'
import { Button } from '../Button'

type FlashSaleBandProps = {
  /** Short offer text, e.g. "40% OFF" */
  offerText: string
  /** Ultra-thin descriptor above the number, e.g. "up to" */
  preLabel: string
  /** Regular descriptor below the number, e.g. "bestselling skincare" */
  postLabel: string
  /** ISO 8601 target — shows countdown when provided */
  endsAtIso?: string
  /** CTA button label */
  ctaLabel?: string
  onPressCta?: () => void
  loading?: boolean
  disabled?: boolean
}

export function FlashSaleBand({
  offerText,
  preLabel,
  postLabel,
  endsAtIso,
  ctaLabel = 'Shop Now',
  onPressCta,
  loading = false,
  disabled = false,
}: FlashSaleBandProps) {
  const c = useThemeColors()
  return (
    <Box
      style={{
        backgroundColor: colors.roseDark,
        paddingVertical: spacing.space4,
        paddingHorizontal: spacing.space4,
        alignItems: 'center',
        gap: spacing.space2,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {/* Offer headline — mixed-weight contrast */}
      <Box style={{ alignItems: 'center', gap: spacing.space1 }}>
        <Text
          style={{
            fontSize: typography.subheadline,
            fontWeight: fontWeights.medium,
            color: c.textInverted,
            letterSpacing: letterSpacing.caps,
            textTransform: 'uppercase',
          }}
        >
          {preLabel}
        </Text>
        <Text
          style={{
            fontSize: typography.headingMd,
            fontWeight: fontWeights.bold,
            color: c.textInverted,
            letterSpacing: letterSpacing.campaignHeading,
          }}
        >
          {offerText}
        </Text>
        <Text
          style={{
            fontSize: typography.body,
            fontWeight: fontWeights.regular,
            color: c.textInverted,
            opacity: 0.85,
          }}
        >
          {postLabel}
        </Text>
      </Box>

      {/* Countdown timer */}
      {endsAtIso ? (
        <CountdownTimer targetIso={endsAtIso} loading={loading} />
      ) : null}

      {/* CTA button */}
      {onPressCta ? (
        <Button
          onPress={disabled ? undefined : onPressCta}
          disabled={disabled}
          variant='premiumAccent'
          shape='pill'
          size='md'
        >
          {ctaLabel}
        </Button>
      ) : null}
    </Box>
  )
}

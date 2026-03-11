import { colors, fontWeights, radius, letterSpacing, spacing, typography } from '@real/tokens'
import { Box, Text, Touchable } from '../../primitives'
import { CountdownTimer } from './CountdownTimer'

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
  return (
    <Box
      style={{
        backgroundColor: colors.brandPrimary,
        paddingVertical: spacing['24'],
        paddingHorizontal: spacing['16'],
        alignItems: 'center',
        gap: spacing['12'],
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {/* Offer headline — mixed-weight contrast */}
      <Box style={{ alignItems: 'center', gap: spacing['1'] }}>
        <Text
          style={{
            fontSize: typography.subheadline,
            fontWeight: fontWeights.ultra,
            color: colors.textInverted,
            letterSpacing: letterSpacing.labelPill,
            textTransform: 'uppercase',
          }}
        >
          {preLabel}
        </Text>
        <Text
          style={{
            fontSize: typography.headline,
            fontWeight: fontWeights.black,
            color: colors.textInverted,
            letterSpacing: letterSpacing.campaignHeading,
            lineHeight: typography.headline * 1.05,
          }}
        >
          {offerText}
        </Text>
        <Text
          style={{
            fontSize: typography.body,
            fontWeight: fontWeights.regular,
            color: colors.textInverted,
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
        <Touchable
          onPress={disabled ? undefined : onPressCta}
          accessibilityRole='button'
          accessibilityLabel={ctaLabel}
          accessibilityState={{ disabled }}
          style={{
            backgroundColor: colors.inkBlack,
            borderRadius: radius.full,
            paddingVertical: spacing['12'],
            paddingHorizontal: spacing['24'],
          }}
        >
          {() => (
            <Text
              style={{
                fontSize: typography.label,
                fontWeight: fontWeights.semibold,
                color: colors.inkFrost,
                letterSpacing: letterSpacing.caps,
                textTransform: 'uppercase',
              }}
            >
              {ctaLabel}
            </Text>
          )}
        </Touchable>
      ) : null}
    </Box>
  )
}

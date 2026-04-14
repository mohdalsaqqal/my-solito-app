import React from 'react'
import { Image, Platform, useWindowDimensions } from 'react-native'
import { colors, fontWeights, letterSpacing, radius, spacing, typography } from '@real/tokens'
import { Box, Text } from '../../primitives'
import { Button } from '../Button'

type CampaignHeroBlockProps = {
  /** Campaign headline */
  headline: string
  /** Ultra-thin descriptor above the headline */
  preHeadline?: string
  /** Regular descriptor below headline */
  subline?: string
  /** Gold badge pill label (e.g. "New Arrivals") */
  badgeLabel?: string
  /** CTA button label */
  ctaLabel?: string
  /** Background image URL */
  imageUrl?: string
  /** Text/CTA alignment */
  align?: 'left' | 'center'
  onPress?: () => void
  loading?: boolean
  disabled?: boolean
}

export const CampaignHeroBlock = React.memo(function CampaignHeroBlock({
  headline,
  preHeadline,
  subline,
  badgeLabel,
  ctaLabel,
  imageUrl,
  align = 'left',
  onPress,
  loading = false,
  disabled = false,
}: CampaignHeroBlockProps) {
  const { width } = useWindowDimensions()
  const isDesktop = Platform.OS === 'web' && width >= 1024
  const blockHeight = isDesktop ? 480 : 340
  const contentAlign = align === 'center' ? 'center' : 'flex-start'

  if (loading) {
    return (
      <Box
        style={{
          backgroundColor: colors.inkBlack,
          height: blockHeight,
          alignItems: contentAlign,
          justifyContent: 'flex-end',
          paddingHorizontal: spacing.space6,
          paddingBottom: spacing.space8,
          gap: spacing.space3,
        }}
      >
        <Box
          style={{
            width: spacing['80'],
            height: spacing['24'],
            borderRadius: radius.full,
            backgroundColor: colors.inkMid,
          }}
        />
        <Box
          style={{
            width: '75%',
            height: spacing['40'],
            borderRadius: radius.sm,
            backgroundColor: colors.inkMid,
          }}
        />
        <Box
          style={{
            width: '50%',
            height: spacing['16'],
            borderRadius: radius.sm,
            backgroundColor: colors.inkMid,
          }}
        />
        <Box
          style={{
            width: spacing['128'],
            height: spacing['40'],
            borderRadius: radius.full,
            backgroundColor: colors.inkMid,
            marginTop: spacing.space2,
          }}
        />
      </Box>
    )
  }

  return (
    <Box
      role="region"
      aria-label={badgeLabel || headline}
      style={{
        height: blockHeight,
        backgroundColor: colors.inkBlack,
        overflow: 'hidden',
      }}
    >
      {/* Background image — absolutely positioned to fill the block, cross-platform via RN Image */}
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={{
            position: 'absolute',
            top: 0,
            start: 0,
            end: 0,
            bottom: 0,
            width: '100%',
            height: '100%',
          }}
          resizeMode='cover'
        />
      ) : null}

      {/* Dark scrim over photo — inkBlack at 52% opacity */}
      {imageUrl ? (
        <Box
          pointerEvents='none'
          style={{
            position: 'absolute',
            top: 0,
            start: 0,
            end: 0,
            bottom: 0,
            backgroundColor: colors.inkBlack,
            opacity: 0.52,
          }}
        />
      ) : null}

      {/* Content */}
      <Box
        style={{
          flex: 1,
          alignItems: contentAlign,
          justifyContent: 'flex-end',
          paddingHorizontal: spacing.space6,
          paddingBottom: spacing.space8,
          gap: spacing.space2,
          opacity: disabled ? 0.5 : 1,
        }}
      >
        {/* Gold badge pill */}
        {badgeLabel ? (
          <Box
            style={{
              alignSelf: contentAlign === 'center' ? 'center' : 'flex-start',
              backgroundColor: colors.coralPrimary,
              borderRadius: radius.full,
              paddingVertical: spacing['4'],
              paddingHorizontal: spacing['12'],
              marginBottom: spacing.space1,
            }}
          >
            <Text
              style={{
                fontSize: typography.caption,
                fontWeight: fontWeights.semibold,
                color: colors.inkBlack,
                letterSpacing: letterSpacing.labelPill,
                textTransform: 'uppercase',
              }}
            >
              {badgeLabel}
            </Text>
          </Box>
        ) : null}

        {/* Pre-headline descriptor — ultra-thin */}
        {preHeadline ? (
          <Text
            style={{
              fontSize: typography.subheadline,
              fontWeight: fontWeights.ultra,
              color: colors.inkFrost,
              opacity: 0.75,
              letterSpacing: letterSpacing.labelPill,
              textTransform: 'uppercase',
              textAlign: align,
            }}
          >
            {preHeadline}
          </Text>
        ) : null}

        {/* Main headline */}
        <Text
          style={{
            // Use headline (56px) for longer text, campaign (72px) for short punchy headlines
            fontSize: headline.length > 20 ? typography.headline : typography.campaign,
            fontWeight: fontWeights.black,
            color: colors.textInverted,
            letterSpacing: letterSpacing.campaignHeading,
            textAlign: align,
          }}
        >
          {headline}
        </Text>

        {/* Subline */}
        {subline ? (
          <Text
            style={{
              fontSize: typography.body,
              fontWeight: fontWeights.regular,
              color: colors.inkFrost,
              opacity: 0.8,
              textAlign: align,
              marginBottom: spacing.space1,
            }}
          >
            {subline}
          </Text>
        ) : null}

        {/* CTA button */}
        {ctaLabel && onPress ? (
          <Box
            style={{
              alignSelf: contentAlign === 'center' ? 'center' : 'flex-start',
              marginTop: spacing.space2,
            }}
          >
            <Button
              onPress={disabled ? undefined : onPress}
              disabled={disabled}
              variant='primaryCommerce'
              shape='pill'
              size='md'
            >
              {ctaLabel}
            </Button>
          </Box>
        ) : null}
      </Box>
    </Box>
  )
})

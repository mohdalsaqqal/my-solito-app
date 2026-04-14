import React from 'react'
import { Image, Platform } from 'react-native'
import { borderWidth, colors, fontFamilies, opacity, radius, shadows, spacing, boxShadowStrings, typography } from '@real/tokens'
import { Box, Text } from '../primitives'
import { HomeHeroItem } from './home/types'
import { useThemeColors } from '../responsive'
import { Button as ReusableButton } from '../reusables/button'

type HeroSlideCardProps = {
  item: HomeHeroItem
  width: number
  imageAspectRatio: number
  onPress?: (href?: string) => void
}

const FALLBACK_IMAGE = '/brand-logo-placeholder.svg'

export const HeroSlideCard = React.memo(function HeroSlideCard({
  item,
  width,
  imageAspectRatio,
  onPress,
}: HeroSlideCardProps) {
  const c = useThemeColors()
  const badgeText = item.badgeLabel ?? item.title
  
  // Force 16:9 aspect ratio for hero distinction (vs product cards at 1:1 or 4:5)
  const heroAspectRatio = 16 / 9

  return (
    <ReusableButton
      onPress={() => onPress?.(item.href)}
      variant='ghost'
      size='default'
      style={{
        width,
        borderRadius: radius.xl,
        overflow: 'hidden',
        backgroundColor: c.surface,
        // Subtle elevation for hero prominence
        ...(Platform.OS === 'web'
          ? ({ boxShadow: boxShadowStrings.md } as any)
          : shadows.md),
      }}
    >
      {/* Full-bleed hero image */}
      <Box style={{ position: 'relative' }}>
        <Image
          source={{ uri: item.imageUrl || FALLBACK_IMAGE }}
          style={{
            width: '100%',
            aspectRatio: heroAspectRatio,
            backgroundColor: c.backgroundSecondary,
          }}
          resizeMode='cover'
        />

        {/* Gradient overlay for text legibility — 40% opacity, 70% height */}
        <Box
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '70%',
            backgroundColor: colors.black,
            opacity: opacity.overlayLight,
          }}
        />
      </Box>

      {/* Text overlays — title + subtitle on gradient */}
      {item.title ? (
        <Box
          style={{
            position: 'absolute',
            bottom: spacing['24'],
            left: spacing['24'],
            right: spacing['24'],
            gap: spacing.space2,
          }}
        >
          <Text
            style={{
              fontSize: typography.display,
              fontWeight: 700,
              color: colors.white,
              fontFamily: fontFamilies.serif,
              lineHeight: Math.round(typography.display * 1.2),
              letterSpacing: -0.8,
            }}
            numberOfLines={2}
          >
            {item.title}
          </Text>
          {item.subtitle ? (
            <Text
              style={{
                fontSize: typography.body,
                fontWeight: 500,
                color: colors.white,
                opacity: 0.85,
                lineHeight: Math.round(typography.body * 1.4),
              }}
              numberOfLines={2}
            >
              {item.subtitle}
            </Text>
          ) : null}
        </Box>
      ) : null}

      {/* Badge - top left, more prominent */}
      {badgeText ? (
        <Box
          style={{
            position: 'absolute',
            top: spacing['12'],
            start: spacing['12'],
            backgroundColor: c.brandPrimary,
            paddingHorizontal: spacing['12'],
            paddingVertical: spacing['8'],
            borderRadius: radius.md,
          }}
        >
          <Text 
            variant='label' 
            tone='inverse' 
            weight='800'
            style={{ 
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            {badgeText}
          </Text>
        </Box>
      ) : null}
      
      {/* CTA - bottom, larger with better presence */}
      {item.ctaLabel ? (
        <Box
          style={{
            position: 'absolute',
            bottom: spacing['16'],
            left: spacing['16'],
            right: spacing['16'],
          }}
        >
          <ReusableButton
            onPress={() => onPress?.(item.href)}
            variant='ghost'
            size='default'
            style={{
              minHeight: spacing['56'],
              paddingHorizontal: spacing['24'],
              borderWidth: borderWidth.none,
              borderRadius: radius.md,
              backgroundColor: colors.commercePrimary,
              alignItems: 'center',
              justifyContent: 'center',
              ...(Platform.OS === 'web'
                ? ({ boxShadow: boxShadowStrings.md } as any)
                : shadows.md),
            }}
          >
            <Text
              variant='body'
              tone='inverse'
              weight='800'
              style={{
                textTransform: 'uppercase',
                letterSpacing: 0.8,
                fontSize: 13,
              }}
            >
              {item.ctaLabel}
            </Text>
          </ReusableButton>
        </Box>
      ) : null}
    </ReusableButton>
  )
})

import React from 'react'
import { Image, Platform } from 'react-native'
import { borderWidth, radius, shadows, spacing, boxShadowStrings } from '@real/tokens'
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
        borderRadius: radius['2xl'],
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
        
        {/* Gradient overlay for text legibility - reduced to 30% for better image visibility */}
        <Box
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '60%',
            backgroundColor: 'rgba(0, 0, 0, 0.30)',
          }}
        />
      </Box>
      
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
            variant='secondary'
            size='default'
            style={{
              minHeight: spacing['56'],
              paddingHorizontal: spacing['24'],
              borderWidth: borderWidth.none,
              borderRadius: radius.md,
              backgroundColor: c.surface,
              alignItems: 'center',
              justifyContent: 'center',
              // Subtle shadow for CTA prominence
              ...(Platform.OS === 'web'
                ? ({ boxShadow: boxShadowStrings.md } as any)
                : shadows.md),
            }}
          >
            <Text
              variant='body'
              tone='default'
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

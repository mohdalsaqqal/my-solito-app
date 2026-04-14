"use client"

import React from 'react'
import { Image, Platform } from 'react-native'
import { borderWidth, fontFamilies, radius, spacing } from '@real/tokens'
import { Box, Text } from '../../primitives'
import { HomeUgcItem } from '../home/types'
import { Button } from '../Button'
import { Button as ReusableButton } from '../../reusables/button'
import { useBreakpoint, useThemeColors } from '../../responsive'

type UgcGalleryProps = {
  title?: string
  items: HomeUgcItem[]
  state?: 'loading' | 'empty' | 'error' | 'disabled' | 'default'
  errorMessage?: string | null
  onRetry?: () => void
  onPressItem?: (item: HomeUgcItem) => void
}

const FALLBACK_IMAGE = '/brand-logo-placeholder.svg'

export const UgcGallery = React.memo(function UgcGallery({
  title = 'Looks From Our Community',
  items,
  state = 'default',
  errorMessage,
  onRetry,
  onPressItem,
}: UgcGalleryProps) {
  const c = useThemeColors()
  const profile = useBreakpoint()
  const desktop = profile.breakpoint === 'desktop'
  const columns = desktop ? 5 : 2
  const gap = spacing.space4
  const viewport = profile.containerWidth
  const tileWidth = Math.max(spacing['96'], (viewport - gap * (columns - 1)) / columns)
  const showLoading = state === 'loading'
  const showDisabled = state === 'disabled'
  const renderedItems: HomeUgcItem[] = showLoading
    ? Array.from({ length: columns * 2 }).map((_, index) => ({
        id: `loading-${index}`,
        imageUrl: FALLBACK_IMAGE,
        caption: '',
      }))
    : items

  if (state === 'error') {
    return (
      <Box style={{ gap: spacing.space4 }}>
        <Text variant='h2' style={{ fontFamily: fontFamilies.serif, letterSpacing: -0.3 }}>{title}</Text>
        <Box
          style={{
            borderWidth: borderWidth.thin,
            borderColor: c.border,
            borderRadius: radius.xs,
            backgroundColor: c.surface,
            padding: spacing.space4,
            gap: spacing.space2,
          }}
        >
          <Text tone='danger' variant='bodySm'>
            {errorMessage || 'Unable to load community looks.'}
          </Text>
          {onRetry ? (
            <Button onPress={onRetry} size='sm' variant='outline'>
              Retry
            </Button>
          ) : null}
        </Box>
      </Box>
    )
  }

  if (state === 'empty' || items.length === 0) {
    return (
      <Box style={{ gap: spacing.space4 }}>
        <Text variant='h2' style={{ fontFamily: fontFamilies.serif, letterSpacing: -0.3 }}>{title}</Text>
        <Text tone='muted' variant='bodySm'>
          No community looks available right now.
        </Text>
      </Box>
    )
  }

  return (
    <Box data-ect-node="UgcGallery" role="region" aria-label={title} style={{ gap: spacing.space4 }}>
      <Text
        variant='h2'
        {...(Platform.OS === 'web' ? { accessibilityRole: 'heading' as any, 'aria-level': 2 } : {})}
        style={{ fontFamily: fontFamilies.serif, letterSpacing: -0.3 }}
      >
        {title}
      </Text>
      <Box style={{ flexDirection: 'row', flexWrap: 'wrap', gap }}>
        {renderedItems.map((item) => (
          <ReusableButton
            key={item.id}
            disabled={showDisabled || showLoading}
            onPress={() => onPressItem?.(item)}
            variant='ghost'
            size='default'
            style={{
              width: tileWidth,
              borderWidth: borderWidth.thin,
              borderColor: c.border,
              borderRadius: radius.xs,
              overflow: 'hidden',
              backgroundColor: c.surface,
            }}
          >
            <Image
              source={{ uri: item.imageUrl || FALLBACK_IMAGE }}
              accessibilityLabel={item.caption || 'Community photo'}
              alt={item.caption || 'Community photo'}
              {...(Platform.OS === 'web' ? { loading: 'lazy' as const } : {})}
              resizeMode='cover'
              style={{
                width: '100%',
                aspectRatio: 1,
                backgroundColor: c.backgroundSecondary,
                opacity: showLoading ? 0.45 : showDisabled ? 0.65 : 1,
              }}
            />
            {item.caption && !showLoading ? (
              <Box
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  paddingHorizontal: spacing.space2,
                  paddingVertical: spacing.space2,
                  backgroundColor: c.black,
                }}
              >
                <Text variant='caption' tone='inverse' numberOfLines={2}>
                  {item.caption}
                </Text>
              </Box>
            ) : null}
          </ReusableButton>
        ))}
      </Box>
    </Box>
  )
})

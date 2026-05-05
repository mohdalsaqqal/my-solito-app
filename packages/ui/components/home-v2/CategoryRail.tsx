"use client"

import React, { useEffect, useRef, useState } from 'react'
import { Image, Platform, ScrollView } from 'react-native'
import {
  breakpoints,
  colors,
  componentTokens,
  elevation,
  fontFamilies,
  layout,
  opacity,
  radius,
  shadows,
  spacing,
} from '@real/tokens'
import { Box, Text } from '../../primitives'
import { Button as ReusableButton } from '../../reusables/button'
import { Icon, IconName } from '../Icon'
import { IconButton } from '../IconButton'
import { HomeCategoryItem } from '../home/types'
import { useRailAutoplay } from '../useRailAutoplay'
import { usePrefersReducedMotion } from '../usePrefersReducedMotion'
import { useBreakpoint, useThemeColors } from '../../responsive'
import { useRovingTabIndex } from '../../hooks/useRovingTabIndex'

type CategoryRailProps = {
  title?: string
  items: HomeCategoryItem[]
  autoplay?: boolean
  autoplayMs?: number
  onPressItem?: (item: HomeCategoryItem) => void
}

const DEPARTMENT_ICONS: IconName[] = [
  'categories',
  'deals',
  'quickView',
  'wishlist',
  'trending',
]

const DEPARTMENT_BACKGROUNDS = [
  colors.backgroundSecondary,
  colors.backgroundSecondary,
  colors.backgroundSecondary,
  colors.backgroundSecondary,
  colors.backgroundSecondary,
]

function scrollRailBy(
  railRef: React.MutableRefObject<ScrollView | null>,
  offsetRef: React.MutableRefObject<number>,
  viewportRef: React.MutableRefObject<number>,
  contentRef: React.MutableRefObject<number>,
  distance: number,
  direction: 'prev' | 'next',
) {
  const maxOffset = Math.max(0, contentRef.current - viewportRef.current)
  const target = direction === 'prev'
    ? Math.max(0, offsetRef.current - distance)
    : Math.min(maxOffset, offsetRef.current + distance)
  railRef.current?.scrollTo({ x: target, animated: true })
  offsetRef.current = target
}

function RailEdgeFade({ edge, color }: { edge: 'start' | 'end'; color: string }) {
  const direction = edge === 'start' ? 'to right' : 'to left'
  return (
    <Box
      style={
        {
          position: 'absolute',
          pointerEvents: 'none',
          top: 0,
          bottom: 0,
          [edge]: 0,
          width: spacing['32'],
          ...(Platform.OS === 'web'
            ? { backgroundImage: `linear-gradient(${direction}, ${color} 0%, transparent 100%)` }
            : { backgroundColor: color, opacity: opacity.overlayDark }),
        } as any
      }
    />
  )
}

function RailNavButton({
  direction,
  top,
  edge,
  onPress,
}: {
  direction: 'prev' | 'next'
  top: number
  edge: number
  onPress: () => void
}) {
  // Center on edge: half of IconButton lg size (44/2 = 22)
  const navButtonHalfSize = 22
  return (
    <Box
      style={
        {
          position: 'absolute',
          top,
          transform: [{ translateY: -navButtonHalfSize }],
          [direction === 'prev' ? 'start' : 'end']: edge,
        } as any
      }
    >
      <IconButton
        icon={direction === 'prev' ? 'caretLeft' : 'caretRight'}
        label={direction === 'prev' ? 'Previous categories' : 'Next categories'}
        tone='soft'
        size='lg'
        onPress={onPress}
      />
    </Box>
  )
}

export const CategoryRail = React.memo(function CategoryRail({
  title = 'Top Categories',
  items,
  autoplay,
  autoplayMs,
  onPressItem,
}: CategoryRailProps) {
  const profile = useBreakpoint()
  const c = useThemeColors()
  const railRef = useRef<ScrollView | null>(null)
  const offsetRef = useRef(0)
  const viewportRef = useRef(0)
  const contentRef = useRef(0)
  const layoutTokens = componentTokens.storefrontHome.layout
  const prefersReducedMotion = usePrefersReducedMotion()

  const isDesktop = profile.breakpoint === 'desktop'
  const contentPaddingX = isDesktop
    ? componentTokens.storefrontHome.contentPaddingXDesktop
    : componentTokens.storefrontHome.contentPaddingXMobile

  const tileSize = isDesktop ? 140 : 100
  const tileGap = isDesktop ? spacing['20'] : spacing['12']
  const getRovingProps = useRovingTabIndex({ itemCount: items.length, orientation: 'horizontal' })

  useRailAutoplay({
    enabled: autoplay && !prefersReducedMotion,
    autoplayMs,
    railRef,
    offsetRef,
    viewportRef,
    contentRef,
    stepDistance: tileSize + tileGap,
    itemCount: items.length,
  })

  if (!items || items.length === 0) return null

  return (
    <Box
      data-ect-node='CategoryRail'
      role='region'
      aria-label={title}
      style={{
        backgroundColor: c.background,
        overflow: 'hidden',
      }}
    >
      <Box
        style={{
          width: '100%',
          maxWidth: layout.containerMaxWidth,
          alignSelf: 'center',
          paddingHorizontal: contentPaddingX,
          paddingVertical: layoutTokens.categorySectionPaddingY,
          gap: layoutTokens.categorySectionGap,
        }}
      >
        <Box style={{ alignItems: 'center', gap: spacing['6'] }}>
          <Box
            style={{
              minHeight: spacing['24'],
              borderRadius: radius.sm,
              paddingHorizontal: spacing['10'],
              justifyContent: 'center',
              backgroundColor: c.background,
            }}
          >
            <Text variant='caption' tone='primary' weight='700' style={{ textTransform: 'uppercase' }}>
              Shop by category
            </Text>
          </Box>
          <Text
            variant='h2'
            weight='700'
            {...(Platform.OS === 'web' ? { accessibilityRole: 'heading' as any, 'aria-level': 2 } : {})}
            style={{
              textAlign: 'center',
              color: c.textPrimary,
              fontFamily: fontFamilies.serif,
              letterSpacing: -0.3,
            }}
          >
            {title}
          </Text>
          <Text
            variant='bodySm'
            tone='muted'
            style={{
              textAlign: 'center',
              maxWidth: '70%',
            }}
          >
            Move quickly between active beauty categories without losing campaign momentum.
          </Text>
        </Box>

        <Box style={{ position: 'relative' }}>
          <ScrollView
            ref={railRef}
            horizontal
            nestedScrollEnabled
            directionalLockEnabled
            showsHorizontalScrollIndicator={false}
            onLayout={(e) => { viewportRef.current = e.nativeEvent.layout.width }}
            onContentSizeChange={(w) => { contentRef.current = w }}
            onScroll={(e) => { offsetRef.current = e.nativeEvent.contentOffset.x }}
            scrollEventThrottle={16}
            contentContainerStyle={{
              gap: tileGap,
              paddingTop: spacing['8'],
              paddingBottom: spacing['8'],
              alignItems: 'flex-start',
            }}
            {...(Platform.OS === 'web' ? { role: 'listbox' as any, 'aria-label': title } : {})}
          >
            {items.map((item, index) => {
              const rovingProps = getRovingProps(index)
              return (
                <Box
                  key={item.id}
                  {...(Platform.OS === 'web'
                    ? ({ ref: rovingProps.ref, tabIndex: rovingProps.tabIndex, onKeyDown: rovingProps.onKeyDown, role: 'option', 'aria-label': item.label } as any)
                    : {})}
                >
                  <ReusableButton
                    accessibilityRole='button'
                    accessibilityLabel={item.label}
                    onPress={() => onPressItem?.(item)}
                    variant='ghost'
                    style={({ hovered, focused }: any) => {
                  const active = hovered || focused
                  return {
                    width: tileSize,
                    alignItems: 'center',
                    gap: spacing['8'],
                    borderRadius: radius.sm,
                    paddingHorizontal: spacing['8'],
                    paddingVertical: spacing['8'],
                    opacity: 1,
                    transform: active ? [{ translateY: -2 }] : [{ translateY: 0 }],
                    transitionProperty: 'opacity,transform,background-color,box-shadow',
                    transitionDuration: '180ms',
                    backgroundColor: active ? c.surface : 'transparent',
                    ...(Platform.OS === 'web'
                      ? { boxShadow: active ? elevation.sm : elevation.none }
                      : active
                        ? shadows.xs
                        : shadows.none),
                  }
                }}
              >
                <Box
                  style={{
                    width: tileSize,
                    height: tileSize,
                    borderRadius: radius.sm,
                    overflow: 'hidden',
                    backgroundColor: DEPARTMENT_BACKGROUNDS[index % DEPARTMENT_BACKGROUNDS.length],
                  }}
                >
                  {item.imageUrl ? (
                    <Image
                      source={{ uri: item.imageUrl }}
                      alt={item.label}
                      style={{
                        width: '100%',
                        height: '100%',
                      }}
                      resizeMode='cover'
                    />
                  ) : (
                    <Box style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                      <Icon
                        name={DEPARTMENT_ICONS[index % DEPARTMENT_ICONS.length]!}
                        size={tileSize * 0.4}
                        color={c.textSecondary}
                      />
                    </Box>
                  )}
                </Box>

                <Text
                  variant='caption'
                  weight='600'
                  numberOfLines={2}
                  style={{
                    textAlign: 'center',
                    color: c.textPrimary,
                    letterSpacing: 0.2,
                  }}
                >
                  {item.label}
                </Text>
              </ReusableButton>
                </Box>
              )
            })}
          </ScrollView>

          {items.length > (isDesktop ? 6 : 4) && (
            <>
              <RailEdgeFade edge='start' color={c.surface} />
              <RailEdgeFade edge='end' color={c.surface} />
            </>
          )}
          {isDesktop && items.length > 6 && (
            <>
              <RailNavButton
                direction='prev'
                top={Math.round(tileSize / 2)}
                edge={-spacing['12']}
                onPress={() => scrollRailBy(railRef, offsetRef, viewportRef, contentRef, tileSize + tileGap, 'prev')}
              />
              <RailNavButton
                direction='next'
                top={Math.round(tileSize / 2)}
                edge={-spacing['12']}
                onPress={() => scrollRailBy(railRef, offsetRef, viewportRef, contentRef, tileSize + tileGap, 'next')}
              />
            </>
          )}
        </Box>
      </Box>
    </Box>
  )
})

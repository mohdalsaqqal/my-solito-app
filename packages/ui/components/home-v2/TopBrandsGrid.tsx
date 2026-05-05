"use client"

import React, { useEffect, useState } from 'react'
import { Image, Platform, ScrollView } from 'react-native'
import { colors, componentTokens, fontFamilies, motionDuration, radius, spacing } from '@real/tokens'
import { Box, Text } from '../../primitives'
import { HomeBrandItem } from '../home/types'
import { Button as ReusableButton } from '../../reusables/button'
import { useBreakpoint, useThemeColors } from '../../responsive'
import { useRovingTabIndex } from '../../hooks/useRovingTabIndex'

type TopBrandsGridProps = {
  title?: string
  items: HomeBrandItem[]
  onPressItem?: (item: HomeBrandItem) => void
}

function normalizeBrandLabel(name: string) {
  return name.replace(/\s+/g, ' ').trim()
}

export const TopBrandsGrid = React.memo(function TopBrandsGrid({
  title = 'Top Brands',
  items,
  onPressItem,
}: TopBrandsGridProps) {
  const profile = useBreakpoint()
  const c = useThemeColors()
  const isDesktop = profile.breakpoint === 'desktop'
  const tokens = componentTokens.storefrontHome.topBrands
  const tileSize = isDesktop ? tokens.tileSizeDesktop : tokens.tileSizeMobile + spacing.space3
  const getRovingProps = useRovingTabIndex({ itemCount: items.length, orientation: 'horizontal' })

  if (!items || items.length === 0) {
    return null
  }

  return (
    <Box data-ect-node="TopBrandsGrid" role="region" aria-label={title} style={{ gap: tokens.sectionGap }}>
      <Box align='center' style={{ paddingBottom: spacing.space2 }}>
        <Text variant='h2' style={{ fontFamily: fontFamilies.serif, letterSpacing: -0.3 }}>{title}</Text>
      </Box>
      {isDesktop ? (
        <Box
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: tokens.desktopGap,
            justifyContent: 'center',
          }}
        >
          {items.map((item) => (
            <BrandTile
              key={item.id}
              item={item}
              tileSize={tileSize}
              onPressItem={onPressItem}
            />
          ))}
        </Box>
      ) : (
        <ScrollView
          horizontal
          nestedScrollEnabled
          directionalLockEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: tokens.mobileGap, paddingHorizontal: spacing.space1 }}
          {...(Platform.OS === 'web' ? { role: 'listbox' as any, 'aria-label': title } : {})}
        >
          {items.map((item, index) => {
            const rovingProps = getRovingProps(index)
            return (
              <Box
                key={item.id}
                {...(Platform.OS === 'web'
                  ? ({ ref: rovingProps.ref, tabIndex: rovingProps.tabIndex, onKeyDown: rovingProps.onKeyDown, role: 'option', 'aria-label': item.name } as any)
                  : {})}
              >
                <BrandTile
                  item={item}
                  tileSize={tileSize}
                  onPressItem={onPressItem}
                />
              </Box>
            )
          })}
        </ScrollView>
      )}
    </Box>
  )
})

function BrandTile({
  item,
  tileSize,
  onPressItem,
}: {
  item: HomeBrandItem
  tileSize: number
  onPressItem?: (item: HomeBrandItem) => void
}) {
  const c = useThemeColors()
  const tokens = componentTokens.storefrontHome.topBrands
  const normalizedName = normalizeBrandLabel(item.name)
  const [logoError, setLogoError] = useState(false)

  const hasLogo = !!item.logoUrl && !logoError

  const textStyle = {
    color: c.textPrimary,
    textAlign: 'center' as const,
    maxWidth: `${tokens.tileTextMaxWidthRatio * 100}%` as const,
    fontSize:
      tileSize >= tokens.tileSizeDesktop
        ? tokens.tileTextSizeDesktop
        : tokens.tileTextSizeMobile,
    lineHeight:
      tileSize >= tokens.tileSizeDesktop
        ? tokens.tileTextLineHeightDesktop
        : tokens.tileTextLineHeightMobile,
    letterSpacing: tokens.tileTextTracking,
  }

  return (
    <ReusableButton
      onPress={() => onPressItem?.(item)}
      variant='ghost'
      size='default'
      style={({ hovered, focused }: any) => {
        const active = hovered || focused
        return {
          width: tileSize,
          alignItems: 'center',
          gap: spacing.space3,
          opacity: active ? 1 : 0.98,
          transform: active ? [{ translateY: -tokens.hoverLift }] : [{ translateY: 0 }],
          transitionProperty: 'opacity, transform',
          transitionDuration: `${motionDuration.interactive}ms`,
        }
      }}
    >
      <Box
        style={{
          width: tileSize,
          height: tileSize,
          borderRadius: radius.lg,
          backgroundColor: c.surfaceMuted,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal:
            tileSize >= tokens.tileSizeDesktop
              ? tokens.tilePaddingXDesktop
              : tokens.tilePaddingXMobile,
        }}
      >
        {hasLogo ? (
          <Image
            source={{ uri: item.logoUrl }}
            resizeMode='contain'
            style={{
              width: '80%',
              height: '80%',
            }}
            onError={() => setLogoError(true)}
          />
        ) : (
          <Text
            variant='label'
            numberOfLines={2}
            style={textStyle}
          >
            {normalizedName}
          </Text>
        )}
      </Box>
    </ReusableButton>
  )
}

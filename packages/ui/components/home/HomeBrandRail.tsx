import React, { useState } from 'react'
import { Image, ScrollView } from 'react-native'
import { borderWidth, boxShadowStrings, radius, spacing } from '@real/tokens'
import { Box, Text } from '../../primitives'
import { MarketplaceSectionHeader } from '../MarketplaceSectionHeader'
import { HomeBrandItem } from './types'
import { Button as ReusableButton } from '../../reusables/button'
import { useThemeColors } from '../../responsive'

type HomeBrandRailProps = {
  items: HomeBrandItem[]
  onPressItem?: (item: HomeBrandItem) => void
  onPressViewAll?: () => void
}

const FALLBACK_IMAGE = '/brand-logo-placeholder.svg'

export function HomeBrandRail({ items, onPressItem, onPressViewAll }: HomeBrandRailProps) {
  const c = useThemeColors()
  if (items.length === 0) {
    return null
  }

  return (
    <Box style={{ gap: spacing['8'] }}>
      <MarketplaceSectionHeader
        title='Top Brands'
        actionLabel='View all'
        onPressAction={onPressViewAll}
        size='sm'
      />
      <ScrollView
        horizontal
        nestedScrollEnabled
        directionalLockEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: spacing.xs }}
      >
        {items.map((item) => {
          const [hovered, setHovered] = useState(false)
          return (
            <ReusableButton
              key={item.id}
              onPress={() => onPressItem?.(item)}
              variant='ghost'
              size='default'
              onPointerEnter={() => setHovered(true)}
              onPointerLeave={() => setHovered(false)}
              style={{
                width: spacing.xxl * 2.5,
                borderWidth: borderWidth.thin,
                borderColor: hovered ? c.roseBlush : c.border,
                borderRadius: radius.md,
                backgroundColor: c.surface,
                alignItems: 'center',
                justifyContent: 'center',
                padding: spacing['16'],
                gap: spacing.xs,
                transform: hovered ? [{ translateY: -2 }] : [{ translateY: 0 }],
                boxShadow: hovered ? boxShadowStrings.xs : 'none',
              }}
            >
              <Image
                source={{ uri: item.logoUrl || FALLBACK_IMAGE }}
                alt={item.name}
                style={{
                  width: spacing.xxl + spacing.md,
                  height: spacing.xxl + spacing.md,
                  borderRadius: radius.full,
                  backgroundColor: c.backgroundSecondary,
                }}
              />
              <Text variant='caption' numberOfLines={1}>{item.name}</Text>
            </ReusableButton>
          )
        })}
      </ScrollView>
    </Box>
  )
}

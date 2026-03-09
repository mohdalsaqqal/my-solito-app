import { Image, ScrollView } from 'react-native'
import { borderWidth, colors, radius, spacing } from '@real/tokens'
import { Box, Text, Touchable } from '../../primitives'
import { HomeBrandItem } from './types'

type HomeBrandRailProps = {
  items: HomeBrandItem[]
  onPressItem?: (item: HomeBrandItem) => void
}

const FALLBACK_IMAGE = '/brand-logo-placeholder.svg'

export function HomeBrandRail({ items, onPressItem }: HomeBrandRailProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <Box style={{ gap: spacing['16'] }}>
      <Text variant='title'>Brands Spotlight</Text>
      <ScrollView
        horizontal
        nestedScrollEnabled
        directionalLockEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: spacing.xs }}
      >
        {items.map((item) => (
          <Touchable
            key={item.id}
            onPress={() => onPressItem?.(item)}
            style={{
              width: spacing.xxl * 3,
              borderWidth: borderWidth.thin,
              borderColor: colors.border,
              borderRadius: radius.xs,
              backgroundColor: colors.surface,
              alignItems: 'center',
              justifyContent: 'center',
              padding: spacing['16'],
              gap: spacing.xs,
            }}
          >
            <Image
              source={{ uri: item.logoUrl || FALLBACK_IMAGE }}
              style={{
                width: spacing.xxl + spacing.sm,
                height: spacing.xxl + spacing.sm,
                borderRadius: radius.full,
                backgroundColor: colors.backgroundSecondary,
              }}
            />
            <Text variant='caption' numberOfLines={1}>{item.name}</Text>
          </Touchable>
        ))}
      </ScrollView>
    </Box>
  )
}

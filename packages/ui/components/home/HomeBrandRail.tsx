import { Image, ScrollView } from 'react-native'
import { borderWidth, radius, spacing } from '@real/tokens'
import { Box, Text } from '../../primitives'
import { HomeBrandItem } from './types'
import { Button as ReusableButton } from '../../reusables/button'
import { useThemeColors } from '../../responsive'

type HomeBrandRailProps = {
  items: HomeBrandItem[]
  onPressItem?: (item: HomeBrandItem) => void
}

const FALLBACK_IMAGE = '/brand-logo-placeholder.svg'

export function HomeBrandRail({ items, onPressItem }: HomeBrandRailProps) {
  const c = useThemeColors()
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
          <ReusableButton
            key={item.id}
            onPress={() => onPressItem?.(item)}
            variant='ghost'
            size='default'
            style={{
              width: spacing.xxl * 3,
              borderWidth: borderWidth.thin,
              borderColor: c.border,
              borderRadius: radius.xs,
              backgroundColor: c.surface,
              alignItems: 'center',
              justifyContent: 'center',
              padding: spacing['16'],
              gap: spacing.xs,
            }}
          >
            <Image
              source={{ uri: item.logoUrl || FALLBACK_IMAGE }}
              alt={item.name}
              style={{
                width: spacing.xxl + spacing.sm,
                height: spacing.xxl + spacing.sm,
                borderRadius: radius.full,
                backgroundColor: c.backgroundSecondary,
              }}
            />
            <Text variant='caption' numberOfLines={1}>{item.name}</Text>
          </ReusableButton>
        ))}
      </ScrollView>
    </Box>
  )
}

import { Image, ScrollView } from 'react-native'
import { borderWidth, colors, elevation, motionDuration, radius, spacing } from '@real/tokens'
import { Box, Text, Touchable } from '../../primitives'
import { HomeBrandItem } from '../home/types'

type TopBrandsGridProps = {
  title?: string
  items: HomeBrandItem[]
  onPressItem?: (item: HomeBrandItem) => void
}

const FALLBACK_IMAGE = '/brand-logo-placeholder.svg'

export function TopBrandsGrid({
  title = 'Top Brands',
  items,
  onPressItem,
}: TopBrandsGridProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <Box style={{ gap: spacing['16'] }}>
      <Box align='center' style={{ paddingBottom: spacing['8'] }}>
        <Text variant='h2'>{title}</Text>
      </Box>
      <Box
        style={{
          gap: spacing['16'],
        }}
      >
        <ScrollView
          horizontal
          nestedScrollEnabled
          directionalLockEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: spacing['16'] }}
        >
          {items.map((item) => (
            <Touchable key={item.id} onPress={() => onPressItem?.(item)}>
              {({ hovered, focused }) => {
                const active = hovered || focused
                return (
                  <Box
                    style={{
                      width: spacing.xxl * 3.8,
                      borderWidth: borderWidth.thin,
                      borderColor: active ? colors.primary : colors.border,
                      borderRadius: radius.md,
                      backgroundColor: colors.surface,
                      padding: spacing.sm,
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: spacing.xs,
                      boxShadow: active ? elevation.sm : elevation.none,
                      transform: active ? [{ translateY: -1 }] : [{ translateY: 0 }],
                      transitionProperty: 'border-color, transform, box-shadow',
                      transitionDuration: `${motionDuration.microInteraction}ms`,
                    }}
                  >
                    <Image
                      source={{ uri: item.logoUrl || FALLBACK_IMAGE }}
                      style={{
                        width: spacing.xxl + spacing.md,
                        height: spacing.xxl + spacing.md,
                        borderRadius: radius.xs,
                        backgroundColor: colors.backgroundSecondary,
                      }}
                    />
                    <Text variant='caption' numberOfLines={1} tone='muted'>
                      {item.name}
                    </Text>
                  </Box>
                )
              }}
            </Touchable>
          ))}
        </ScrollView>
      </Box>
    </Box>
  )
}

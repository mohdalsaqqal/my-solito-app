import { ScrollView } from 'react-native'
import { borderWidth, colors, radius, spacing } from '@real/tokens'
import { Box, Text, Touchable } from '../../primitives'
import { HomeCategoryItem } from './types'

type HomeCategoryStripProps = {
  items: HomeCategoryItem[]
  onPressItem?: (item: HomeCategoryItem) => void
  onPressViewAll?: () => void
}

export function HomeCategoryStrip({
  items,
  onPressItem,
  onPressViewAll,
}: HomeCategoryStripProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <Box style={{ gap: spacing['16'] }}>
      <Box style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text variant='title'>Main Categories</Text>
        <Touchable onPress={onPressViewAll}>
          <Text variant='label' tone='primary' style={{ textTransform: 'uppercase' }}>
            View all categories
          </Text>
        </Touchable>
      </Box>
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
              borderWidth: borderWidth.thin,
              borderColor: colors.border,
              borderRadius: radius.xs,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.xs,
              backgroundColor: colors.surface,
            }}
          >
            <Text variant='bodySm'>{item.label}</Text>
          </Touchable>
        ))}
      </ScrollView>
    </Box>
  )
}

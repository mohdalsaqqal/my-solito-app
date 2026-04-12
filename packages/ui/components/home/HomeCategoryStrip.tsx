import { ScrollView } from 'react-native'
import { borderWidth, radius, spacing } from '@real/tokens'
import { Box, Text } from '../../primitives'
import { MarketplaceSectionHeader } from '../MarketplaceSectionHeader'
import { HomeCategoryItem } from './types'
import { Button as ReusableButton } from '../../reusables/button'
import { useThemeColors } from '../../responsive'

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
  const c = useThemeColors()
  if (items.length === 0) {
    return null
  }

  return (
    <Box style={{ gap: spacing['8'] }}>
      <MarketplaceSectionHeader
        title='Main Categories'
        meta='Fast access'
        actionLabel='View all'
        onPressAction={onPressViewAll}
      />
      <ScrollView
        horizontal
        nestedScrollEnabled
        directionalLockEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: spacing['8'] }}
      >
        {items.map((item) => (
          <ReusableButton
            key={item.id}
            onPress={() => onPressItem?.(item)}
            variant='ghost'
            size='default'
            style={{
              borderWidth: borderWidth.thin,
              borderColor: c.border,
              borderRadius: radius.sm,
              minWidth: spacing['96'],
              paddingHorizontal: spacing['12'],
              paddingVertical: spacing['10'],
              backgroundColor: c.surface,
            }}
          >
            <Box style={{ gap: spacing['4'] }}>
              <Text variant='bodySm'>{item.label}</Text>
              {item.itemCount ? (
                <Text variant='caption' tone='muted'>{`${item.itemCount} items`}</Text>
              ) : null}
            </Box>
          </ReusableButton>
        ))}
      </ScrollView>
    </Box>
  )
}

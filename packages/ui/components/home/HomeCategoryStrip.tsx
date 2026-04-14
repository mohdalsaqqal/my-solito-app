import React, { useState } from 'react'
import { Pressable, ScrollView } from 'react-native'
import { borderWidth, radius, spacing } from '@real/tokens'
import { Box, Text } from '../../primitives'
import { HomeCategoryItem } from './types'
import { useThemeColors } from '../../responsive'

type HomeCategoryStripProps = {
  items: HomeCategoryItem[]
  onPressItem?: (item: HomeCategoryItem) => void
}

export function HomeCategoryStrip({
  items,
  onPressItem,
}: HomeCategoryStripProps) {
  const c = useThemeColors()
  if (items.length === 0) {
    return null
  }

  return (
    <Box>
      <ScrollView
        horizontal
        nestedScrollEnabled
        directionalLockEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          gap: spacing['12'],
          paddingHorizontal: spacing.pageX,
          paddingVertical: spacing.space2,
        }}
      >
        {items.map((item) => {
          const [pressed, setPressed] = useState(false)
          const circleDiameter = 56
          const iconOrLabel = item.icon
            ? item.icon
            : item.label.charAt(0).toUpperCase()

          return (
            <Pressable
              key={item.id}
              onPress={() => onPressItem?.(item)}
              onPressIn={() => setPressed(true)}
              onPressOut={() => setPressed(false)}
              style={{
                alignItems: 'center',
                gap: spacing.space2,
                minWidth: circleDiameter,
                opacity: pressed ? 0.7 : 1,
              }}
            >
              <Box
                style={{
                  width: circleDiameter,
                  height: circleDiameter,
                  borderRadius: radius.full,
                  backgroundColor: c.roseBlush,
                  borderWidth: borderWidth.thin,
                  borderColor: c.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  variant='bodySm'
                  weight='700'
                  style={{
                    fontSize: 18,
                    lineHeight: 22,
                    color: c.textPrimary,
                  }}
                >
                  {iconOrLabel}
                </Text>
              </Box>
              <Text
                variant='caption'
                weight='500'
                tone='default'
                numberOfLines={1}
                style={{
                  width: circleDiameter,
                  textAlign: 'center',
                  fontSize: 10,
                  lineHeight: 13,
                }}
              >
                {item.label}
              </Text>
            </Pressable>
          )
        })}
      </ScrollView>
    </Box>
  )
}

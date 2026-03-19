import { ViewStyle } from 'react-native'
import { borderWidth, colors, iconSizes, radius, spacing } from '@real/tokens'
import { Box } from '../../primitives/Box'
import { Text } from '../../primitives/Text'
import { Touchable } from '../../primitives/Touchable'
import { Icon } from '../Icon'

export type MiniSearchBarProps = {
  placeholder: string
  onPress: () => void
  dir?: 'ltr' | 'rtl'
}

export function MiniSearchBar({ placeholder, onPress, dir = 'ltr' }: MiniSearchBarProps) {
  const isRtl = dir === 'rtl'

  const barStyle: ViewStyle = {
    backgroundColor: colors.surface,
    borderBottomWidth: borderWidth.thin,
    borderBottomColor: colors.divider,
    paddingHorizontal: spacing.pageX,
    paddingVertical: spacing.sm,
  }

  const pillStyle: ViewStyle = {
    flexDirection: isRtl ? 'row-reverse' : 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.full,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    minHeight: spacing['40'],
  }

  return (
    <Box style={barStyle}>
      <Touchable
        onPress={onPress}
        accessibilityRole="search"
        accessibilityLabel={placeholder}
      >
        <Box style={pillStyle}>
          <Icon
            name="search"
            size={iconSizes.sm}
            color={colors.textMuted}
            weight="regular"
          />
          <Text
            variant="bodySm"
            tone="muted"
            numberOfLines={1}
            style={{ flex: 1 }}
          >
            {placeholder}
          </Text>
        </Box>
      </Touchable>
    </Box>
  )
}

import { useMemo } from 'react'
import { ViewStyle } from 'react-native'
import { borderWidth, colors, iconSizes, radius, spacing } from '@real/tokens'
import { Box } from '../../primitives/Box'
import { Text } from '../../primitives/Text'
import { Icon } from '../Icon'
import { Button as ReusableButton } from '../../reusables/button'
import { useThemeColors } from '../../responsive'

export type MiniSearchBarProps = {
  placeholder: string
  onPress: () => void
  dir?: 'ltr' | 'rtl'
}

const barStyle: ViewStyle = {
  backgroundColor: colors.surface,
  borderBottomWidth: borderWidth.thin,
  borderBottomColor: colors.divider,
  paddingHorizontal: spacing.pageX,
  paddingVertical: spacing.sm,
}

const pillBaseStyle: ViewStyle = {
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

const buttonResetStyle: ViewStyle = {
  paddingHorizontal: spacing.none,
  paddingVertical: spacing.none,
  borderRadius: radius.full,
}

export function MiniSearchBar({ placeholder, onPress, dir = 'ltr' }: MiniSearchBarProps) {
  const c = useThemeColors()
  const isRtl = dir === 'rtl'

  const pillStyle = useMemo<ViewStyle>(
    () => ({ ...pillBaseStyle, flexDirection: isRtl ? 'row-reverse' : 'row' }),
    [isRtl],
  )

  return (
    <Box style={barStyle}>
      <ReusableButton
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={placeholder}
        variant='ghost'
        size='default'
        style={buttonResetStyle}
      >
        <Box style={pillStyle}>
          <Icon
            name="search"
            size={iconSizes.sm}
            color={c.textMuted}
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
      </ReusableButton>
    </Box>
  )
}

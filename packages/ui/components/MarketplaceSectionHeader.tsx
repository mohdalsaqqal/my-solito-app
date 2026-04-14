import { colors, fontFamilies, fontWeights, radius, spacing, typography } from '@real/tokens'
import type { TextStyle } from 'react-native'
import { Box, Text } from '../primitives'
import { Button } from './Button'
import { useThemeColors } from '../responsive'

type SectionSize = 'lg' | 'md' | 'sm'

type MarketplaceSectionHeaderProps = {
  title: string
  eyebrow?: string
  meta?: string
  actionLabel?: string
  onPressAction?: () => void
  size?: SectionSize
}

const titleStylesBySize: Record<SectionSize, TextStyle> = {
  lg: {
    fontSize: 28,
    fontWeight: '800' as TextStyle['fontWeight'],
    fontFamily: fontFamilies.serif,
    letterSpacing: -0.8,
  },
  md: {
    fontSize: 18,
    fontWeight: '800' as TextStyle['fontWeight'],
    fontFamily: undefined,
    letterSpacing: 0,
  },
  sm: {
    fontSize: 16,
    fontWeight: '600' as TextStyle['fontWeight'],
    fontFamily: undefined,
    letterSpacing: 0,
  },
}

export function MarketplaceSectionHeader({
  title,
  eyebrow,
  meta,
  actionLabel,
  onPressAction,
  size = 'md',
}: MarketplaceSectionHeaderProps) {
  const c = useThemeColors()
  const titleStyle = titleStylesBySize[size]

  return (
    <Box
      style={{
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: spacing['8'],
      }}
    >
      <Box style={{ flex: 1, gap: spacing['4'] }}>
        {eyebrow ? (
          <Box
            style={{
              alignSelf: 'flex-start',
              minHeight: spacing['24'],
              borderRadius: radius.full,
              paddingHorizontal: spacing['8'],
              justifyContent: 'center',
              backgroundColor: c.roseBlush,
            }}
          >
            <Text
              variant='caption'
              style={{
                textTransform: 'uppercase',
                color: colors.roseDeep,
              }}
            >
              {eyebrow}
            </Text>
          </Box>
        ) : null}
        <Text
          style={{
            fontSize: titleStyle.fontSize,
            fontWeight: titleStyle.fontWeight,
            fontFamily: titleStyle.fontFamily,
            letterSpacing: titleStyle.letterSpacing,
            lineHeight: titleStyle.fontSize ? Math.round(titleStyle.fontSize * 1.3) : undefined,
          }}
        >
          {title}
        </Text>
        {meta ? (
          <Text variant='caption' tone='muted' weight='500' style={{ textTransform: 'uppercase' }}>
            {meta}
          </Text>
        ) : null}
      </Box>
      {actionLabel && onPressAction ? (
        <Button onPress={onPressAction} shape='pill' size='sm' variant='secondaryQuiet'>
          {actionLabel} →
        </Button>
      ) : null}
    </Box>
  )
}

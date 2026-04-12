import { fontFamilies, radius, spacing } from '@real/tokens'
import { Box, Text } from '../primitives'
import { Button } from './Button'
import { useThemeColors } from '../responsive'

type MarketplaceSectionHeaderProps = {
  title: string
  eyebrow?: string
  meta?: string
  actionLabel?: string
  onPressAction?: () => void
}

export function MarketplaceSectionHeader({
  title,
  eyebrow,
  meta,
  actionLabel,
  onPressAction,
}: MarketplaceSectionHeaderProps) {
  const c = useThemeColors()
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
              backgroundColor: c.surfaceMuted,
            }}
          >
            <Text variant='caption' tone='danger' style={{ textTransform: 'uppercase' }}>
              {eyebrow}
            </Text>
          </Box>
        ) : null}
        <Text
          variant='h2'
          weight='700'
          style={{ fontFamily: fontFamilies.serif, letterSpacing: -0.3 }}
        >
          {title}
        </Text>
        {meta ? (
          <Text variant='caption' tone='muted' weight='600' style={{ textTransform: 'uppercase' }}>
            {meta}
          </Text>
        ) : null}
      </Box>
      {actionLabel && onPressAction ? (
        <Button onPress={onPressAction} shape='pill' size='sm' variant='secondaryQuiet'>
          {actionLabel.toUpperCase()}
        </Button>
      ) : null}
    </Box>
  )
}

import { borderWidth, radius, spacing } from '@real/tokens'
import { Box, Text } from '../primitives'
import { Button } from './Button'
import { useThemeColors } from '../responsive'

type MarketplacePromoStripProps = {
  badge?: string
  title: string
  subtitle?: string
  actionLabel?: string
  onPressAction?: () => void
}

export function MarketplacePromoStrip({
  badge,
  title,
  subtitle,
  actionLabel,
  onPressAction,
}: MarketplacePromoStripProps) {
  const c = useThemeColors()
  return (
    <Box
      style={{
        borderRadius: radius.sm,
        paddingHorizontal: spacing['12'],
        paddingVertical: spacing['8'],
        backgroundColor: c.surfaceMuted,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing['8'],
      }}
    >
      <Box style={{ flex: 1, gap: spacing['4'] }}>
        {badge ? (
          <Box
            style={{
              alignSelf: 'flex-start',
              minHeight: spacing['24'],
              borderRadius: radius.full,
              backgroundColor: c.brandPrimarySubtle,
              borderWidth: borderWidth.thin,
              borderColor: c.brandPrimary,
              paddingHorizontal: spacing['8'],
              justifyContent: 'center',
            }}
          >
            <Text variant='caption' tone='primary' style={{ textTransform: 'uppercase' }}>
              {badge}
            </Text>
          </Box>
        ) : null}
        <Text variant='bodySm' weight='500' tone='muted'>{title}</Text>
        {subtitle ? <Text variant='bodySm' tone='muted'>{subtitle}</Text> : null}
      </Box>
      {actionLabel && onPressAction ? (
        <Button onPress={onPressAction} shape='pill' size='sm' variant='secondaryQuiet'>
          {actionLabel.toUpperCase()}
        </Button>
      ) : null}
    </Box>
  )
}

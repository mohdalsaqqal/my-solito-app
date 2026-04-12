import React from 'react'
import { borderWidth, layout, radius, spacing } from '@real/tokens'
import { Box } from '../../primitives/Box'
import { Text } from '../../primitives/Text'
import { Button } from '../Button'
import { useThemeColors } from '../../responsive'

type StorefrontStatusPanelProps = {
  title: string
  subtitle: string
  ctaLabel: string
  onRetry: () => void
}

export const StorefrontStatusPanel = React.memo(function StorefrontStatusPanel({
  title,
  subtitle,
  ctaLabel,
  onRetry,
}: StorefrontStatusPanelProps) {
  const c = useThemeColors()
  return (
    <Box
      style={{
        minHeight: spacing['96'] * 2,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.pageX,
        paddingVertical: spacing['40'],
        backgroundColor: c.backgroundSecondary,
      }}
    >
      <Box
        style={{
          width: '100%',
          maxWidth: layout.maxWidth.account,
          overflow: 'hidden',
          borderRadius: radius.lg,
          borderWidth: borderWidth.thin,
          borderColor: c.border,
          backgroundColor: c.surfaceMuted,
        }}
      >
        <Box
          style={{
            position: 'relative',
            overflow: 'hidden',
            paddingHorizontal: spacing['24'],
            paddingVertical: spacing['32'],
            backgroundColor: c.surfaceMuted,
          }}
        >
          <Box
            aria-hidden
            style={{
              width: spacing['48'],
              height: spacing['48'],
              borderRadius: radius.full,
              backgroundColor: c.brandPrimarySubtle,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: spacing['16'],
            }}
          >
            <Text variant='h2' tone='primary'>!</Text>
          </Box>
          <Text variant='title' weight='700'>
            {title}
          </Text>
          <Text
            variant='bodySm'
            tone='muted'
            style={{ marginTop: spacing.sm, maxWidth: layout.maxWidth.cart }}
          >
            {subtitle}
          </Text>
          <Box style={{ marginTop: spacing['24'] }}>
            <Button variant='outline' onPress={onRetry}>
              {ctaLabel}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  )
})

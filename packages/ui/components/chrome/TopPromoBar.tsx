import { colors, layout, letterSpacing, motionDuration, radius, spacing } from '@real/tokens'
import { Box, Container, Text, Touchable } from '../../primitives'

type TopPromoBarProps = {
  message: string
  secondaryMessage?: string
  ctaLabel?: string
  onPressCta?: () => void
  state?: 'loading' | 'empty' | 'error' | 'disabled' | 'default'
}

export function TopPromoBar({
  message,
  secondaryMessage,
  ctaLabel,
  onPressCta,
  state = 'default',
}: TopPromoBarProps) {
  const promoBarHeight = layout.header.topBarHeight

  if (state === 'empty') {
    return null
  }

  if (state === 'loading') {
    return (
      <Box style={{ minHeight: promoBarHeight, backgroundColor: colors.backgroundSecondary }}>
        <Container>
          <Box style={{ minHeight: promoBarHeight, justifyContent: 'center' }}>
            <Text variant='nav' tone='muted' weight='700'>
              ...
            </Text>
          </Box>
        </Container>
      </Box>
    )
  }

  return (
    <Box
      style={{
        minHeight: layout.header.topBarHeight,
        backgroundColor: colors.brandPrimary,
      }}
    >
      <Container>
        <Box
          style={{
            minHeight: promoBarHeight,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.sm,
          }}
        >
          <Text
            variant='caption'
            weight='700'
            tone='inverse'
            numberOfLines={1}
            style={{ letterSpacing: letterSpacing.wide }}
          >
            {state === 'error' ? 'Unable to load promotion.' : message}
          </Text>
          {secondaryMessage ? (
            <Text variant='caption' tone='inverse' numberOfLines={1} style={{ opacity: 0.88 }}>
              • {secondaryMessage}
            </Text>
          ) : null}
          {ctaLabel ? (
            <Touchable
              disabled={state === 'disabled'}
              onPress={onPressCta}
            >
              {({ hovered, focused }) => (
                <Box
                  style={{
                    minHeight: spacing['24'],
                    paddingHorizontal: spacing.sm,
                    borderRadius: radius.md,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: hovered || focused ? colors.white : colors.brandPrimary,
                    transitionProperty: 'background-color,color',
                    transitionDuration: `${motionDuration.microInteraction}ms`,
                  }}
                >
                  <Text
                    variant='caption'
                    weight='700'
                    tone={hovered || focused ? 'default' : 'inverse'}
                    style={{ textTransform: 'uppercase', letterSpacing: letterSpacing.wide }}
                  >
                    {ctaLabel}
                  </Text>
                </Box>
              )}
            </Touchable>
          ) : null}
        </Box>
      </Container>
    </Box>
  )
}

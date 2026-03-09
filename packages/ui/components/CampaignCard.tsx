import { Image } from 'react-native'
import { borderWidth, colors, motionDuration, radius, spacing } from '@real/tokens'
import { Box, Text, Touchable } from '../primitives'
import { Button } from './Button'

type CampaignCardProps = {
  title: string
  subtitle?: string
  ctaLabel?: string
  href?: string
  imageUrl?: string
  onPress?: (href?: string) => void
  aspectRatio?: number
  titleVariant?: 'title' | 'subtitle' | 'h2'
  compact?: boolean
}

const FALLBACK_IMAGE = '/brand-logo-placeholder.svg'

export function CampaignCard({
  title,
  subtitle,
  ctaLabel,
  href,
  imageUrl,
  onPress,
  aspectRatio = 21 / 8,
  titleVariant = 'title',
  compact = false,
}: CampaignCardProps) {
  return (
    <Touchable
      onPress={href ? () => onPress?.(href) : undefined}
      style={{
        borderWidth: borderWidth.thin,
        borderColor: colors.border,
        borderRadius: radius.md,
        overflow: 'hidden',
        backgroundColor: colors.surface,
        flex: 1,
      }}
    >
      {({ hovered, focused }) => {
        const active = hovered || focused
        return (
          <>
            <Image
              source={{ uri: imageUrl || FALLBACK_IMAGE }}
              style={{
                width: '100%',
                aspectRatio,
                backgroundColor: colors.backgroundSecondary,
                transform: active ? [{ scale: 1.01 }] : [{ scale: 1 }],
                transitionProperty: 'transform',
                transitionDuration: `${motionDuration.hoverScale}ms`,
              } as any}
            />
            <Box p='md' gap='sm' style={{ backgroundColor: colors.surface }}>
              <Text variant={titleVariant} weight='700'>
                {title}
              </Text>
              {subtitle ? (
                <Text tone='muted' variant='bodySm' numberOfLines={compact ? 2 : undefined}>
                  {subtitle}
                </Text>
              ) : null}
              {ctaLabel ? (
                <Box style={{ marginTop: spacing.xs, alignSelf: 'flex-start' }}>
                  <Button size='sm'>{ctaLabel}</Button>
                </Box>
              ) : null}
            </Box>
          </>
        )
      }}
    </Touchable>
  )
}

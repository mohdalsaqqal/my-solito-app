import { Image } from 'react-native'
import { borderWidth, colors, motionDuration, radius, spacing } from '@real/tokens'
import { Box, Text, Touchable } from '../primitives'
import { HomeHeroItem } from './home/types'

type HeroSlideCardProps = {
  item: HomeHeroItem
  width: number
  imageAspectRatio: number
  onPress?: (href?: string) => void
}

const FALLBACK_IMAGE = '/brand-logo-placeholder.svg'

export function HeroSlideCard({
  item,
  width,
  imageAspectRatio,
  onPress,
}: HeroSlideCardProps) {
  const badgeText = item.badgeLabel ?? item.title

  return (
    <Touchable
      onPress={() => onPress?.(item.href)}
      style={{
        width,
        borderWidth: borderWidth.thin,
        borderColor: colors.border,
        borderRadius: radius.xs,
        overflow: 'hidden',
        backgroundColor: colors.surface,
      }}
    >
      <Image
        source={{ uri: item.imageUrl || FALLBACK_IMAGE }}
        style={{
          width: '100%',
          aspectRatio: imageAspectRatio,
          backgroundColor: colors.backgroundSecondary,
        }}
        resizeMode='cover'
      />
      {badgeText ? (
        <Box
          style={{
            position: 'absolute',
            top: spacing['16'],
            start: spacing['16'],
            borderWidth: borderWidth.thick,
            borderColor: colors.primary,
            backgroundColor: colors.primary,
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs,
            transitionProperty: 'opacity',
            transitionDuration: `${motionDuration.fast}ms`,
          }}
        >
          <Text variant='caption' tone='inverse' style={{ textTransform: 'uppercase' }}>
            {badgeText}
          </Text>
        </Box>
      ) : null}
      {item.ctaLabel ? (
        <Box
          style={{
            position: 'absolute',
            bottom: spacing['16'],
            left: 0,
            right: 0,
            alignItems: 'center',
          }}
        >
          <Touchable
            onPress={() => onPress?.(item.href)}
            style={{
              minHeight: spacing['40'],
              paddingHorizontal: spacing['16'],
              borderWidth: borderWidth.thin,
              borderColor: colors.black,
              borderRadius: radius.xs,
              backgroundColor: colors.black,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              variant='label'
              tone='inverse'
              weight='700'
              style={{ textTransform: 'uppercase' }}
            >
              {item.ctaLabel}
            </Text>
          </Touchable>
        </Box>
      ) : null}
    </Touchable>
  )
}

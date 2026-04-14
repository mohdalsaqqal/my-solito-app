import React from 'react'
import { Image, Platform } from 'react-native'
import { borderWidth, radius, spacing } from '@real/tokens'
import { Box, Text } from '../primitives'
import { Button } from './Button'
import { useThemeColors } from '../responsive'
import { Button as ReusableButton } from '../reusables/button'

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

export const CampaignCard = React.memo(function CampaignCard({
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
  const c = useThemeColors()
  return (
    <ReusableButton
      onPress={href ? () => onPress?.(href) : undefined}
      disabled={!href}
      variant='ghost'
      size='default'
      style={{
        borderWidth: borderWidth.thin,
        borderColor: c.border,
        borderRadius: radius.md,
        overflow: 'hidden',
        backgroundColor: c.surface,
        flex: 1,
      }}
    >
      <Image
        source={{ uri: imageUrl || FALLBACK_IMAGE }}
        style={{
          width: '100%',
          aspectRatio,
          backgroundColor: c.backgroundSecondary,
        } as any}
        {...(Platform.OS === 'web' ? { loading: 'lazy' } : {})}
      />
      <Box p='md' gap='xs' style={{ backgroundColor: c.surface }}>
        <Text variant={titleVariant} weight='700'>
          {title}
        </Text>
        {subtitle ? (
          <Text tone='muted' variant='bodySm' numberOfLines={compact ? 2 : undefined}>
            {subtitle}
          </Text>
        ) : null}
        {ctaLabel ? (
          <Box style={{ marginTop: spacing.space2, alignSelf: 'flex-start' }}>
            <Button size='sm'>{ctaLabel}</Button>
          </Box>
        ) : null}
      </Box>
    </ReusableButton>
  )
})

"use client"

import React, { useState } from 'react'
import { Image, Platform } from 'react-native'
import {
  borderWidth,
  boxShadowStrings,
  componentTokens,
  motionDuration,
  motionEasing,
  radius,
  spacing,
} from '@real/tokens'
import type {
  ProductCardBadge,
  ProductCardModel,
  ProductCardProps,
  ProductCardVariant,
} from './ProductCard.types'
import { Box, Text } from '../primitives'
import { Button as ReusableButton } from '../reusables/button'
import { Badge } from './Badge'
import { Button } from './Button'
import { Card } from './Card'
import { Icon } from './Icon'
import { IconButton } from './IconButton'
import { useThemeColors } from '../responsive'

const BADGE_TONE_BY_KIND: Record<ProductCardBadge['kind'], 'accent' | 'outline' | 'ink'> = {
  discount: 'accent',
  new: 'outline',
  bestseller: 'ink',
  bundle: 'outline',
}

const VARIANT_TO_DENSITY = {
  default: 'comfortable',
  compact: 'minimal',
  featured: 'comfortable',
  cartable: 'compact',
} as const

type ProductCardSkeletonProps = {
  width: number
  variant?: ProductCardVariant
}

export function ProductCardSkeleton({
  width,
  variant = 'default',
}: ProductCardSkeletonProps) {
  const c = useThemeColors()
  const cardTokens = componentTokens.storefrontHome.productCard
  const density = componentTokens.storefrontHome.productCardDensity[VARIANT_TO_DENSITY[variant]]

  return (
    <Box
      style={{
        width,
        padding: 0,
        gap: density.cardGap,
        borderWidth: borderWidth.thin,
        borderColor: c.border,
        borderRadius: radius.md,
        backgroundColor: c.surface,
      }}
    >
      <Box
        style={{
          aspectRatio: density.mediaAspectRatio,
          backgroundColor: c.backgroundSecondary,
          borderBottomWidth: borderWidth.thin,
          borderColor: c.border,
        }}
      />
      <Box
        style={{
          gap: density.contentGap,
          paddingHorizontal: density.contentPaddingX,
          paddingBottom: density.contentPaddingY,
        }}
      >
        <Box style={{ width: '40%', height: density.brandLineHeight, backgroundColor: c.backgroundSecondary }} />
        <Box style={{ width: '92%', height: density.nameLineHeight, backgroundColor: c.backgroundSecondary }} />
        <Box style={{ width: '84%', height: density.nameLineHeight, backgroundColor: c.backgroundSecondary }} />
        <Box style={{ width: '56%', height: density.priceLineHeight, backgroundColor: c.backgroundSecondary }} />
        <Box style={{ width: '100%', height: cardTokens.buyActionHeight, backgroundColor: c.backgroundSecondary }} />
      </Box>
    </Box>
  )
}

function resolveCtaLabel(item: ProductCardModel) {
  if (!item.inStock) return 'Out of stock'
  if (item.requiresVariantSelection) return 'Choose options'
  return 'Add'
}

function resolveDensity(variant: ProductCardVariant) {
  return componentTokens.storefrontHome.productCardDensity[VARIANT_TO_DENSITY[variant]]
}

export const ProductCard = React.memo(function ProductCard({
  item,
  variant = 'default',
  disabled = false,
  width = componentTokens.storefrontHome.productCard.defaultWidth,
  showWishlist = false,
  showBrand = true,
  showRating = true,
  showQuickAdd = true,
  onPress,
  onPressWishlist,
  onPressAdd,
  testID,
}: ProductCardProps) {
  const c = useThemeColors()
  const cardTokens = componentTokens.storefrontHome.productCard
  const density = resolveDensity(variant)
  const isDisabled = disabled || !item.inStock
  const compareAtVisible =
    typeof item.compareAtPrice?.amount === 'number' &&
    item.compareAtPrice.amount > item.price.amount
  const ctaLabel = resolveCtaLabel(item)
  const visibleBadges = item.badges?.slice(0, variant === 'compact' ? 1 : 2) ?? []
  const showWishlistAction = showWishlist && item.wishlistEnabled
  const showRatingMeta = showRating && typeof item.rating?.average === 'number'
  const cardMinHeight = variant === 'featured' ? spacing['40'] * 9 : undefined
  const [hovered, setHovered] = useState(false)
  const isWeb = Platform.OS === 'web'

  const hoverShadow = isWeb && !isDisabled ? boxShadowStrings.sm : undefined
  const restShadow = isWeb ? 'none' : undefined
  const cardTransform = isWeb && hovered ? [{ translateY: -2 }] : [{ translateY: 0 }]
  const imageTransform = isWeb && hovered ? [{ scale: 1.03 }] : [{ scale: 1 }]
  const transition = isWeb
    ? `transform ${motionDuration.microInteraction}ms ${motionEasing.easeOut}, box-shadow ${motionDuration.microInteraction}ms ${motionEasing.easeOut}`
    : undefined

  return (
    <Card
      radiusKey='md'
      variant='flat'
      testID={testID}
      role='article'
      onPointerEnter={isWeb ? () => setHovered(true) : undefined}
      onPointerLeave={isWeb ? () => setHovered(false) : undefined}
      style={{
        width,
        minHeight: cardMinHeight,
        padding: 0,
        borderWidth: borderWidth.thin,
        borderColor: c.border,
        overflow: 'hidden',
        transform: cardTransform,
        boxShadow: hovered ? hoverShadow : restShadow,
        ...(transition ? { transition } as any : {}),
      }}
    >
      <Box style={{ position: 'relative' }}>
        <ReusableButton
          disabled={!onPress || isDisabled}
          onPress={onPress}
          accessibilityLabel={item.image.alt || item.title}
          variant='ghost'
          size='default'
          style={{
            width: '100%',
            paddingHorizontal: 0,
            paddingVertical: 0,
            borderRadius: 0,
          }}
        >
          <Box
            style={{
              position: 'relative',
              aspectRatio: variant === 'featured' ? 0.92 : density.mediaAspectRatio,
              backgroundColor: c.backgroundSecondary,
              borderBottomWidth: borderWidth.thin,
              borderColor: c.border,
              width: '100%',
              overflow: 'hidden',
            }}
          >
            <Image
              source={{ uri: item.image.url }}
              resizeMode='cover'
              accessibilityLabel={item.image.alt || item.title}
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: c.backgroundSecondary,
                opacity: isDisabled ? 0.6 : 1,
                transform: imageTransform,
                ...(transition ? { transition } as any : {}),
              }}
            />
          </Box>
        </ReusableButton>

        {visibleBadges.length > 0 ? (
          <Box
            style={{
              position: 'absolute',
              top: spacing.space2,
              start: spacing.space2,
              gap: spacing.space1,
            }}
          >
            {visibleBadges.map((badge) => (
              <Badge
                key={`${item.id}-${badge.kind}-${badge.label}`}
                tone={BADGE_TONE_BY_KIND[badge.kind]}
                size='sm'
              >
                {badge.label}
              </Badge>
            ))}
          </Box>
        ) : null}

        {showWishlistAction ? (
          <Box
            style={{
              position: 'absolute',
              top: spacing.space2,
              end: spacing.space2,
            }}
          >
            <IconButton
              icon='wishlist'
              label={item.isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              active={item.isWishlisted}
              disabled={isDisabled}
              onPress={onPressWishlist}
              tone='soft'
              size='lg'
            />
          </Box>
        ) : null}
      </Box>

      <Box
        style={{
          gap: density.contentGap,
          paddingHorizontal: density.contentPaddingX,
          paddingTop: density.contentPaddingY,
          paddingBottom: density.contentPaddingY,
        }}
      >
        {showBrand && item.brand?.name ? (
          <Text
            variant='caption'
            weight='500'
            style={{
              color: c.textSecondary,
              textTransform: 'uppercase',
              letterSpacing: cardTokens.brandTracking,
              fontSize: density.brandFontSize,
              lineHeight: density.brandLineHeight,
            }}
            numberOfLines={1}
          >
            {item.brand.name}
          </Text>
        ) : null}

        <ReusableButton
          disabled={!onPress || isDisabled}
          onPress={onPress}
          accessibilityLabel={item.title}
          variant='ghost'
          size='default'
          style={{
            width: '100%',
            paddingHorizontal: 0,
            paddingVertical: 0,
            justifyContent: 'flex-start',
            borderRadius: 0,
          }}
        >
          <Text
            variant={variant === 'featured' ? 'title' : 'bodySm'}
            weight='700'
            numberOfLines={2}
            style={{
              minHeight: density.nameMinHeight,
              color: c.textPrimary,
              fontSize: density.nameFontSize,
              lineHeight: density.nameLineHeight,
            }}
          >
            {item.title}
          </Text>
        </ReusableButton>

        {showRatingMeta ? (
          <Box
            style={{
              minHeight: cardTokens.ratingMinHeight,
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.space1,
            }}
          >
            <Icon name='star' size={density.ratingSize} color={c.amberWarm} weight='fill' />
            <Text variant='caption' tone='muted'>
              {item.rating!.average.toFixed(1)}
            </Text>
            <Text variant='caption' tone='muted'>
              ({item.reviewCount ?? item.rating!.count})
            </Text>
          </Box>
        ) : null}

        <Box
          style={{
            minHeight: cardTokens.priceRowMinHeight,
            flexDirection: 'row',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: spacing.space2,
          }}
        >
          <Text
            variant='subtitle'
            weight='700'
            style={{
              color: c.textPrimary,
              fontSize: density.priceFontSize,
              lineHeight: density.priceLineHeight,
            }}
          >
            {item.price.formatted}
          </Text>
          {compareAtVisible ? (
            <Text
              variant='caption'
              tone='muted'
              style={{
                textDecorationLine: 'line-through',
                fontSize: density.compareFontSize,
                lineHeight: density.compareLineHeight,
              }}
            >
              {item.compareAtPrice?.formatted}
            </Text>
          ) : null}
        </Box>

        {showQuickAdd ? (
          <Box style={{ minHeight: density.buyActionHeight }}>
            <Button
              variant={item.inStock ? 'primaryCommerce' : 'soft'}
              size='sm'
              fullWidth
              disabled={isDisabled}
              onPress={item.inStock ? (onPressAdd ?? onPress) : undefined}
            >
              {ctaLabel}
            </Button>
          </Box>
        ) : null}
      </Box>
    </Card>
  )
})

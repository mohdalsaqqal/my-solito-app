"use client"

import React from 'react'
import { Image, Platform, Pressable, StyleSheet } from 'react-native'
import { colors, radius, shadows, spacing, typography, fontWeights, boxShadowStrings } from '@real/tokens'
import type { ProductCardModel } from './ProductCard.types'
import { Box, Text } from '../primitives'
import { Icon } from './Icon'
import { useThemeColors } from '../responsive'

// ─── Types ───────────────────────────────────────────────────────────────────

export type ProductCardV2Attribute = {
  label: string
  value: string
}

export type ProductCardV2Props = {
  item: ProductCardModel
  /** Width of the card in px */
  width?: number
  /** Up to 3 attributes shown in the info strip (e.g. volume, shade, size) */
  attributes?: ProductCardV2Attribute[]
  onPress?: () => void
  onPressWishlist?: () => void
  onPressAdd?: () => void
  testID?: string
}

// ─── Static styles ───────────────────────────────────────────────────────────

const s = StyleSheet.create({
  discountBadgeBox: {
    backgroundColor: colors.inkDeep,
    borderRadius: radius.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  discountBadgeText: {
    fontSize: typography.caption,
    fontWeight: fontWeights.bold,
    color: colors.white,
    letterSpacing: 0.2,
    lineHeight: 14,
  },
  attrBadgeBox: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  attrBadgeText: {
    fontSize: typography.caption,
    fontWeight: fontWeights.medium,
    color: colors.inkDeep,
    lineHeight: 14,
  },
  attrLabelText: {
    fontSize: typography.overline,
    fontWeight: fontWeights.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    lineHeight: 11,
  },
  attrValueText: {
    fontSize: typography.body2,
    fontWeight: fontWeights.semibold,
    lineHeight: 17,
  },
  attrSepText: {
    fontSize: typography.overline,
  },
  ratingText: {
    fontSize: typography.body2,
    fontWeight: fontWeights.semibold,
    lineHeight: 17,
  },
  badgeRow: {
    position: 'absolute',
    top: spacing.sm,
    start: spacing.sm,
    flexDirection: 'row',
    gap: spacing.xs,
  },
  infoStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
  },
  attrBlock: {
    flex: 1,
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  attrItem: {
    alignItems: 'center',
  },
  ratingBlock: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaBox: {
    paddingHorizontal: spacing.sm,
    paddingTop: 2,
    paddingBottom: spacing.sm,
    gap: 1,
  },
  brandText: {
    fontSize: typography.caption,
    fontWeight: fontWeights.medium,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    lineHeight: 14,
  },
  titlePriceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  titleText: {
    fontSize: typography.body1,
    fontWeight: fontWeights.bold,
    lineHeight: 20,
  },
  priceCol: {
    alignItems: 'flex-end',
  },
  compareText: {
    fontSize: typography.caption,
    fontWeight: fontWeights.regular,
    textDecorationLine: 'line-through',
    lineHeight: 14,
  },
  priceText: {
    fontSize: typography.price,
    fontWeight: fontWeights.bold,
    lineHeight: 20,
  },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
})

// ─── Sub-components ──────────────────────────────────────────────────────────

function DiscountBadge({ label }: { label: string }) {
  return (
    <Box style={s.discountBadgeBox}>
      <Text style={s.discountBadgeText}>{label}</Text>
    </Box>
  )
}

function AttributeBadge({ label }: { label: string }) {
  return (
    <Box style={s.attrBadgeBox}>
      <Text style={s.attrBadgeText}>{label}</Text>
    </Box>
  )
}

function ActionButton({
  onPress,
  children,
  accessibilityLabel,
}: {
  onPress?: () => void
  children: React.ReactNode
  accessibilityLabel?: string
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole='button'
      style={({ pressed }) => [
        s.actionBtn,
        { backgroundColor: pressed ? colors.surfaceDim : colors.surfaceContainer },
      ]}
    >
      {children}
    </Pressable>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export const ProductCardV2 = React.memo(function ProductCardV2({
  item,
  width = 260,
  attributes = [],
  onPress,
  onPressWishlist,
  onPressAdd,
  testID,
}: ProductCardV2Props) {
  const c = useThemeColors()

  const compareAtVisible =
    typeof item.compareAtPrice?.amount === 'number' &&
    item.compareAtPrice.amount > item.price.amount

  const discountBadge = item.badges?.find((b) => b.kind === 'discount')
  const otherBadge = item.badges?.find((b) => b.kind !== 'discount')

  const cardShadow =
    Platform.OS === 'web'
      ? { boxShadow: boxShadowStrings.sm }
      : shadows.xs

  return (
    <Box
      testID={testID}
      role='article'
      style={[
        { width, backgroundColor: c.surface, borderRadius: radius['2xl'], overflow: 'hidden' },
        cardShadow as object,
      ]}
    >
      {/* ── Image area ─────────────────────────────────────────────── */}
      <Pressable
        onPress={onPress}
        accessibilityLabel={item.image.alt || item.title}
        accessibilityRole='button'
        style={({ pressed }) => ({
          width: '100%',
          aspectRatio: 1,
          backgroundColor: c.backgroundSecondary,
          opacity: pressed ? 0.92 : 1,
        })}
      >
        <Image
          source={{ uri: item.image.url }}
          resizeMode='contain'
          accessibilityLabel={item.image.alt || item.title}
          style={s.fullImage}
        />

        {(discountBadge || otherBadge) ? (
          <Box style={s.badgeRow}>
            {discountBadge ? <DiscountBadge label={discountBadge.label} /> : null}
            {otherBadge ? <AttributeBadge label={otherBadge.label} /> : null}
          </Box>
        ) : null}
      </Pressable>

      {/* ── Info strip ─────────────────────────────────────────────── */}
      <Box style={[s.infoStrip, { borderColor: c.border }]}>
        {attributes.length > 0 ? (
          <Box style={s.attrBlock}>
            {attributes.slice(0, 3).map((attr, i) => (
              <React.Fragment key={attr.label}>
                <Box style={s.attrItem}>
                  <Text style={[s.attrLabelText, { color: c.textMuted }]}>{attr.label}</Text>
                  <Text style={[s.attrValueText, { color: c.textPrimary }]}>{attr.value}</Text>
                </Box>
                {i < Math.min(attributes.length, 3) - 1 ? (
                  <Text style={[s.attrSepText, { color: c.textMuted }]}>×</Text>
                ) : null}
              </React.Fragment>
            ))}
          </Box>
        ) : null}

        {typeof item.rating?.average === 'number' ? (
          <Box style={s.ratingBlock}>
            <Icon name='star' size={12} color={colors.amberWarm} weight='fill' />
            <Text style={[s.ratingText, { color: c.textPrimary }]}>
              {item.rating.average.toFixed(1)}
            </Text>
          </Box>
        ) : null}

        {item.wishlistEnabled ? (
          <ActionButton
            onPress={onPressWishlist}
            accessibilityLabel={item.isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Icon
              name='wishlist'
              size={18}
              color={item.isWishlisted ? colors.brandPrimary : c.inkDeep}
              weight={item.isWishlisted ? 'fill' : 'regular'}
            />
          </ActionButton>
        ) : null}

        {item.inStock ? (
          <ActionButton
            onPress={onPressAdd ?? onPress}
            accessibilityLabel='Add to cart'
          >
            <Icon name='cart' size={18} color={c.inkDeep} />
          </ActionButton>
        ) : null}
      </Box>

      {/* ── Text meta ──────────────────────────────────────────────── */}
      <Box style={s.metaBox}>
        {item.brand?.name ? (
          <Text style={[s.brandText, { color: c.textMuted }]} numberOfLines={1}>
            {item.brand.name}
          </Text>
        ) : null}

        <Box style={s.titlePriceRow}>
          <Pressable
            onPress={onPress}
            accessibilityRole='button'
            accessibilityLabel={item.title}
            style={{ flex: 1, paddingEnd: spacing.sm }}
          >
            <Text style={[s.titleText, { color: c.textPrimary }]} numberOfLines={1}>
              {item.title}
            </Text>
          </Pressable>

          <Box style={s.priceCol}>
            {compareAtVisible ? (
              <Text style={[s.compareText, { color: c.textMuted }]}>
                {item.compareAtPrice?.formatted}
              </Text>
            ) : null}
            <Text style={[s.priceText, { color: c.textPrimary }]}>
              {item.price.formatted}
            </Text>
          </Box>
        </Box>
      </Box>
    </Box>
  )
})

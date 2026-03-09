import { useEffect, useRef, useState } from 'react'
import { Image, Platform } from 'react-native'
import {
  borderWidth,
  colors,
  motionDuration,
  motionEasing,
  radius,
  spacing,
} from '@real/tokens'
import { Box, Text, Touchable } from '../primitives'
import { Card } from './Card'
import { Icon } from './Icon'
import { HomeProductItem } from './home/types'

type ProductCardVariant = 'default' | 'bundle' | 'flash'

type ProductCardState = 'loading' | 'empty' | 'error' | 'disabled' | 'default'

type ProductCardProps = {
  item?: HomeProductItem
  variant?: ProductCardVariant
  width?: number
  contentPadding?: keyof typeof spacing
  state?: ProductCardState
  outOfStock?: boolean
  savingsLabel?: string
  urgencyLabel?: string
  onPress?: (item: HomeProductItem) => void
  onAddToCart?: (item: HomeProductItem) => void
  onQuickView?: (item: HomeProductItem) => void
  onToggleWishlist?: (item: HomeProductItem) => void
  isWishlisted?: boolean
}

const FALLBACK_IMAGE = '/brand-logo-placeholder.svg'
const DEFAULT_CURRENCY = 'USD'

export function ProductCard({
  item,
  variant = 'default',
  width = spacing.xxl * 4,
  contentPadding = 'sm',
  state = 'default',
  outOfStock = false,
  savingsLabel = 'Save 15%',
  urgencyLabel,
  onPress,
  onAddToCart,
  onQuickView,
  onToggleWishlist,
  isWishlisted = false,
}: ProductCardProps) {
  const hoverFadeDuration = motionDuration.microInteraction
  const resolvedContentPadding = spacing[contentPadding]

  const [isHovering, setIsHovering] = useState(false)
  const hideHoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handlePointerEnter = () => {
    if (Platform.OS !== 'web') return
    if (hideHoverTimeoutRef.current) {
      clearTimeout(hideHoverTimeoutRef.current)
      hideHoverTimeoutRef.current = null
    }
    setIsHovering(true)
  }

  const handlePointerLeave = () => {
    if (Platform.OS !== 'web') return
    if (hideHoverTimeoutRef.current) {
      clearTimeout(hideHoverTimeoutRef.current)
    }
    hideHoverTimeoutRef.current = setTimeout(() => {
      setIsHovering(false)
    }, motionDuration.microInteraction / 2)
  }

  useEffect(() => {
    return () => {
      if (hideHoverTimeoutRef.current) {
        clearTimeout(hideHoverTimeoutRef.current)
      }
    }
  }, [])

  const parsePercent = (value?: string) => {
    if (!value) return null
    const matched = value.match(/(\d{1,2})/)
    if (!matched) return null
    const percent = Number(matched[1])
    if (Number.isNaN(percent) || percent <= 0 || percent >= 90) return null
    return percent
  }

  const resolveCompareAtPrice = () => {
    if (item?.compareAtPrice) {
      return item.compareAtPrice
    }
    const percent =
      parsePercent(item?.badge) ??
      parsePercent(savingsLabel) ??
      parsePercent(item?.name)
    if (!item || !percent) return null
    const computed = item.price / (1 - percent / 100)
    return Math.round(computed * 100) / 100
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: DEFAULT_CURRENCY,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)

  if (state === 'loading') {
    return (
      <Card
        tone="subtle"
        radiusKey="xs"
        style={{ width, minHeight: spacing.xxl * 5 }}
      />
    )
  }

  if (state === 'error') {
    return (
      <Card tone="subtle" radiusKey="xs" style={{ width }}>
        <Text tone="danger" variant="bodySm">
          Unable to load product.
        </Text>
      </Card>
    )
  }

  if (state === 'empty' || !item) {
    return (
      <Card tone="subtle" radiusKey="xs" style={{ width }}>
        <Text tone="muted" variant="bodySm">
          No product available.
        </Text>
      </Card>
    )
  }

  const isBundle = variant === 'bundle'
  const inferredOutOfStock =
    Boolean(item.badge && /out of stock|sold out/i.test(item.badge)) ||
    /out of stock|sold out/i.test(item.name)
  const disabled = state === 'disabled' || outOfStock || inferredOutOfStock
  const isWeb = Platform.OS === 'web'
  const hovered = isWeb ? isHovering : false
  const compareAtPrice = resolveCompareAtPrice()
  const hasDiscount = Boolean(compareAtPrice && compareAtPrice > item.price)
  const discountPercent =
    hasDiscount && compareAtPrice
      ? Math.max(
          1,
          Math.round(((compareAtPrice - item.price) / compareAtPrice) * 100),
        )
      : null
  const badgeLabel =
    disabled && (outOfStock || inferredOutOfStock)
      ? 'Out of stock'
      : hasDiscount && discountPercent
        ? `-${discountPercent}%`
        : item.badge || (isBundle ? 'NEW' : undefined)
  const isNewProduct = Boolean(item.isNew || item.badge?.toLowerCase().includes('new'))
  const isLimitedProduct = Boolean(item.isLimited || item.badge?.toLowerCase().includes('limited'))
  const ratingValue = typeof item.rating === 'number' ? Math.max(0, Math.min(5, item.rating)) : null
  const reviewCount = typeof item.reviews === 'number' ? Math.max(0, item.reviews) : null
  const resolvedUrgencyLabel =
    urgencyLabel ??
    item.urgencyLabel ??
    (hasDiscount ? 'Selling fast' : isBundle ? 'Limited stock' : undefined)

  return (
    <Touchable
      key={item.id}
      disabled={disabled}
      onPress={() => onPress?.(item)}
      onPointerEnter={isWeb ? handlePointerEnter : undefined}
      onPointerLeave={isWeb ? handlePointerLeave : undefined}
    >
      <Card
        variant="flat"
        radiusKey="md"
        style={
          {
            width,
            gap: spacing.md,
            padding: 0,
            backgroundColor: colors.surface,
            borderWidth: borderWidth.thin,
            borderColor: colors.border,
            transitionProperty: 'box-shadow, transform',
            transitionDuration: `${motionDuration.hoverScale}ms`,
            transitionTimingFunction: motionEasing.standard,
            transform: hovered ? [{ translateY: 0 }] : [{ translateY: 0 }],
          } as any
        }
      >
        <Box
          style={{
            position: 'relative',
            borderWidth: borderWidth.thin,
            borderColor: colors.border,
            overflow: 'hidden',
          }}
        >
          <Image
            source={{ uri: item.imageUrl || FALLBACK_IMAGE }}
            style={
              {
                width: '100%',
                // Reduce card height by ~15% while preserving width.
                aspectRatio: (4 / 5) / 0.85,
                backgroundColor: isBundle
                  ? colors.surface
                  : colors.backgroundSecondary,
                opacity: disabled ? 0.55 : 1,
                transform: hovered ? [{ scale: 1.02 }] : [{ scale: 1 }],
                transitionProperty: 'transform',
                transitionDuration: `${motionDuration.hoverScale}ms`,
                transitionTimingFunction: motionEasing.standard,
              } as any
            }
          />
          {!disabled ? (
            <Box
              style={
                {
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  bottom: 0,
                  left: 0,
                  backgroundColor: colors.white,
                  opacity: isWeb && hovered ? 0.24 : 0,
                  transitionProperty: 'opacity',
                  transitionDuration: `${hoverFadeDuration}ms`,
                  transitionTimingFunction: motionEasing.standard,
                } as any
              }
            />
          ) : null}
          {disabled ? (
            <Box
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                backgroundColor: colors.black,
                opacity: 0.08,
              }}
            />
          ) : null}

          {isNewProduct || badgeLabel || isLimitedProduct ? (
            <Box
              style={{
                position: 'absolute',
                top: spacing['16'],
                end: spacing['16'],
                gap: spacing['8'],
                alignItems: 'flex-end',
              }}
            >
              {isNewProduct ? (
                <Box
                  style={{
                    borderWidth: borderWidth.thin,
                    borderColor: colors.black,
                    backgroundColor: colors.black,
                    paddingHorizontal: spacing.sm,
                    paddingVertical: spacing.xs,
                  }}
                >
                  <Text
                    variant="label"
                    weight="700"
                    tone="inverse"
                    style={{ textTransform: 'uppercase' }}
                  >
                    New
                  </Text>
                </Box>
              ) : null}
              {badgeLabel ? (
                <Box
                  style={{
                    borderWidth: hasDiscount ? borderWidth.thick : borderWidth.thin,
                    borderColor: hasDiscount ? colors.primary : colors.border,
                    backgroundColor: hasDiscount ? colors.primary : colors.surface,
                    paddingHorizontal: hasDiscount ? spacing.sm : spacing['16'],
                    paddingVertical: hasDiscount ? spacing.sm : spacing.xs,
                  }}
                >
                  <Text
                    variant="label"
                    weight="700"
                    tone={hasDiscount ? 'inverse' : 'default'}
                    style={{ textTransform: 'uppercase' }}
                  >
                    {badgeLabel}
                  </Text>
                </Box>
              ) : null}
              {isLimitedProduct ? (
                <Box
                  style={{
                    borderWidth: borderWidth.thin,
                    borderColor: colors.warning,
                    backgroundColor: colors.warning,
                    paddingHorizontal: spacing.sm,
                    paddingVertical: spacing.xs,
                  }}
                >
                  <Text
                    variant="label"
                    weight="700"
                    tone="inverse"
                    style={{ textTransform: 'uppercase' }}
                  >
                    Limited
                  </Text>
                </Box>
              ) : null}
            </Box>
          ) : null}

          {!disabled ? (
            <Box
              style={
                {
                  position: 'absolute',
                  top: spacing['16'],
                  start: spacing.xs,
                  flexDirection: 'column',
                  gap: spacing['8'],
                  opacity: isWeb ? (hovered ? 1 : 0) : 1,
                  transform: isWeb
                    ? hovered
                      ? [{ translateY: 0 }]
                      : [{ translateY: spacing['8'] }]
                    : [{ translateY: 0 }],
                  transitionProperty: 'opacity, transform',
                  transitionDuration: `${hoverFadeDuration}ms`,
                  transitionTimingFunction: motionEasing.standard,
                } as any
              }
            >
              {isWeb && hovered ? (
                <Touchable
                  onPress={() =>
                    onQuickView ? onQuickView(item) : onPress?.(item)
                  }
                  accessibilityRole="button"
                  accessibilityLabel={`Quick view ${item.name}`}
                >
                  <Box
                    p="xxs"
                    bg="black"
                    style={{
                      borderWidth: borderWidth.thin,
                      borderColor: colors.black,
                    }}
                  >
                    <Icon
                      name="quickView"
                      size={spacing['16']}
                      color={colors.white}
                    />
                  </Box>
                </Touchable>
              ) : null}
              <Touchable
                onPress={() =>
                  onToggleWishlist ? onToggleWishlist(item) : onPress?.(item)
                }
                accessibilityRole="button"
                accessibilityLabel={`Add ${item.name} to wishlist`}
              >
                <Box
                  p="xxs"
                  bg="black"
                  style={{
                    borderWidth: borderWidth.thin,
                    borderColor: colors.black,
                  }}
                >
                  <Icon
                    name="wishlist"
                    size={spacing['16']}
                    color={isWishlisted ? colors.primary : colors.white}
                  />
                </Box>
              </Touchable>
            </Box>
          ) : null}

          {isWeb && !disabled ? (
            <Box
              style={
                {
                  position: 'absolute',
                  top: '50%',
                  marginTop: -spacing['56'],
                  start: spacing['16'],
                  end: spacing['16'],
                  gap: spacing['16'],
                  opacity: hovered ? 1 : 0,
                  transform: hovered
                    ? [{ translateY: 0 }]
                    : [{ translateY: spacing['8'] }],
                  transitionProperty: 'opacity, transform',
                  transitionDuration: `${hoverFadeDuration}ms`,
                  transitionTimingFunction: motionEasing.standard,
                } as any
              }
            >
              <Touchable
                disabled={!hovered}
                onPress={() =>
                  onQuickView ? onQuickView(item) : onPress?.(item)
                }
                style={{
                  minHeight: spacing['48'],
                  paddingHorizontal: spacing.md,
                  backgroundColor: colors.white,
                  borderWidth: borderWidth.thin,
                  borderColor: colors.border,
                  borderRadius: radius.full,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  gap: spacing.xs,
                }}
              >
                <Icon name="quickView" size={spacing['16']} color={colors.textPrimary} />
                <Text variant="bodySm" tone="default">
                  Quick view
                </Text>
              </Touchable>
              <Touchable
                disabled={!hovered}
                onPress={() =>
                  onAddToCart ? onAddToCart(item) : onPress?.(item)
                }
                style={{
                  minHeight: spacing['48'],
                  paddingHorizontal: spacing.md,
                  backgroundColor: variant === 'flash' ? colors.primary : colors.black,
                  borderWidth: borderWidth.thin,
                  borderColor: variant === 'flash' ? colors.primary : colors.black,
                  borderRadius: radius.xs,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  variant="caption"
                  tone="inverse"
                  weight="700"
                  style={{ textTransform: 'uppercase' }}
                >
                  Add to cart
                </Text>
              </Touchable>
            </Box>
          ) : null}
        </Box>

        <Box
          style={{
            minHeight: spacing['96'],
            justifyContent: 'space-between',
            gap: spacing.sm,
            paddingTop: spacing.xs,
            paddingHorizontal: resolvedContentPadding,
            paddingBottom: resolvedContentPadding,
          }}
        >
          <Box style={{ gap: spacing.xs, minHeight: spacing['64'] }}>
            <Text
              variant="label"
              tone="muted"
              weight="700"
              numberOfLines={1}
              style={{ textTransform: 'uppercase' }}
            >
              {item.brand}
            </Text>
            <Text variant="bodySm" tone="muted" numberOfLines={2}>
              {item.name}
            </Text>
          </Box>

          {ratingValue !== null ? (
            <Box style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
              <Text variant="caption" tone="default">
                {'★'.repeat(Math.floor(ratingValue))}
                {'☆'.repeat(Math.max(0, 5 - Math.floor(ratingValue)))}
              </Text>
              {reviewCount !== null ? (
                <Text variant="caption" tone="muted">
                  {reviewCount}
                </Text>
              ) : null}
            </Box>
          ) : null}

          <Box style={{ gap: spacing.sm, minHeight: spacing['32'] }}>
            <Box
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing['8'],
              }}
            >
              <Text variant="price" size="3xl" tone="danger" weight="700">
                {formatCurrency(item.price)}
              </Text>
              {compareAtPrice ? (
                <Text
                  variant="caption"
                  tone="muted"
                  style={{ textDecorationLine: 'line-through' }}
                >
                  {formatCurrency(compareAtPrice)}
                </Text>
              ) : null}
            </Box>
            {resolvedUrgencyLabel ? (
              <Text
                variant="label"
                tone="danger"
                style={{ textTransform: 'uppercase' }}
              >
                {resolvedUrgencyLabel}
              </Text>
            ) : null}

            {disabled && (outOfStock || inferredOutOfStock) ? (
              <Text variant="caption" tone="danger">
                Out of stock
              </Text>
            ) : null}
          </Box>
        </Box>

        {!disabled && !isWeb ? (
          <Touchable
            onPress={() => (onAddToCart ? onAddToCart(item) : onPress?.(item))}
            style={
              {
                minHeight: spacing['48'],
                paddingHorizontal: spacing['16'],
                backgroundColor: variant === 'flash' ? colors.primary : colors.black,
                borderWidth: borderWidth.thin,
                borderColor: variant === 'flash' ? colors.primary : colors.black,
                borderRadius: radius.xs,
                alignItems: 'center',
                justifyContent: 'center',
                transitionProperty: 'opacity, transform, background-color',
                transitionDuration: `${motionDuration.microInteraction}ms`,
                transitionTimingFunction: motionEasing.standard,
              } as any
            }
          >
            <Text
              variant="caption"
              tone="inverse"
              weight="700"
              style={{ textTransform: 'uppercase' }}
            >
              Add to cart
            </Text>
          </Touchable>
        ) : null}
      </Card>
    </Touchable>
  )
}

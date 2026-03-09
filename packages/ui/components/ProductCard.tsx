import { useEffect, useMemo, useRef, useState } from 'react'
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
import { StarRating } from './StarRating'
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
const DEFAULT_SWATCH_COLORS = [
  colors.brandPrimary,
  colors.info,
  colors.warning,
  colors.success,
  colors.textPrimary,
]

function ProductCardSkeleton({ width }: { width: number }) {
  const shimmer = {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radius.xs,
  } as const

  return (
    <Card
      variant='flat'
      radiusKey='md'
      style={{
        width,
        gap: 0,
        padding: 0,
        backgroundColor: colors.surface,
        borderWidth: borderWidth.thin,
        borderColor: colors.border,
        overflow: 'hidden',
      }}
    >
      {/* Image placeholder */}
      <Box style={{ width: '100%', aspectRatio: 1, backgroundColor: colors.backgroundSecondary }} />

      {/* Content */}
      <Box style={{ gap: spacing.sm, padding: spacing.sm, paddingBottom: spacing.md }}>
        <Box style={{ ...shimmer, height: 10, width: '40%' }} />
        <Box style={{ ...shimmer, height: 13, width: '85%' }} />
        <Box style={{ ...shimmer, height: 13, width: '65%' }} />
        <Box style={{ ...shimmer, height: 10, width: '28%', marginTop: spacing.xs }} />
        <Box style={{ ...shimmer, height: 18, width: '42%', marginTop: spacing.xs }} />
      </Box>

      {/* CTA button placeholder */}
      <Box
        style={{
          ...shimmer,
          height: spacing['48'],
          marginHorizontal: spacing.sm,
          marginBottom: spacing.sm,
          borderRadius: radius.xs,
        }}
      />
    </Card>
  )
}

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
  const [showVariantPicker, setShowVariantPicker] = useState(false)
  const [addState, setAddState] = useState<'idle' | 'loading' | 'success'>('idle')
  const [localWishlisted, setLocalWishlisted] = useState(isWishlisted)
  const hideHoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const resetAddTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const parsePercent = (value?: string) => {
    if (!value) return null
    const matched = value.match(/(\d{1,2})/)
    if (!matched) return null
    const percent = Number(matched[1])
    if (Number.isNaN(percent) || percent <= 0 || percent >= 90) return null
    return percent
  }

  const inferredOutOfStock =
    Boolean(item?.badge && /out of stock|sold out/i.test(item.badge)) ||
    Boolean(item?.name && /out of stock|sold out/i.test(item.name))
  const outFromInventory = typeof item?.stock === 'number' ? item.stock <= 0 : false
  const disabled = state === 'disabled' || outOfStock || inferredOutOfStock || outFromInventory
  const isWeb = Platform.OS === 'web'
  const hovered = isWeb ? isHovering : false

  const resolvedSwatches = useMemo(() => {
    if (!item) return []
    if (item.swatches && item.swatches.length > 0) {
      return item.swatches
    }
    if (!item.requiresVariantSelection) {
      return []
    }
    return DEFAULT_SWATCH_COLORS.map((hex, index) => ({
      id: `${item.id}-shade-${index + 1}`,
      hex,
      label: `Shade ${index + 1}`,
      imageUrl: undefined,
    }))
  }, [item])
  const hasSelectableVariants = Boolean(item?.requiresVariantSelection) || resolvedSwatches.length > 0
  const [selectedSwatchId, setSelectedSwatchId] = useState<string | null>(
    resolvedSwatches[0]?.id ?? null
  )

  useEffect(() => {
    setLocalWishlisted(isWishlisted)
  }, [isWishlisted])

  useEffect(() => {
    setSelectedSwatchId(resolvedSwatches[0]?.id ?? null)
  }, [resolvedSwatches])

  useEffect(() => {
    return () => {
      if (hideHoverTimeoutRef.current) {
        clearTimeout(hideHoverTimeoutRef.current)
      }
      if (resetAddTimeoutRef.current) {
        clearTimeout(resetAddTimeoutRef.current)
      }
    }
  }, [])

  const selectedSwatch = resolvedSwatches.find((swatch) => swatch.id === selectedSwatchId)
  const imageUri = selectedSwatch?.imageUrl || item?.imageUrl || FALLBACK_IMAGE

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

  const runAddToCart = () => {
    if (!item || addState === 'loading' || disabled) return
    setAddState('loading')
    if (resetAddTimeoutRef.current) {
      clearTimeout(resetAddTimeoutRef.current)
    }
    setTimeout(() => {
      try {
        if (onAddToCart) {
          onAddToCart(item)
        } else {
          onPress?.(item)
        }
      } finally {
        setAddState('success')
        resetAddTimeoutRef.current = setTimeout(() => {
          setAddState('idle')
        }, motionDuration.slow)
      }
    }, motionDuration.fast)
  }

  const handleAddToCart = () => {
    if (!item) return
    if (hasSelectableVariants && !selectedSwatchId) {
      setShowVariantPicker(true)
      return
    }
    if (hasSelectableVariants && !showVariantPicker) {
      setShowVariantPicker(true)
      return
    }
    setShowVariantPicker(false)
    runAddToCart()
  }

  const handleToggleWishlist = () => {
    if (!item) return
    setLocalWishlisted((prev) => !prev)
    if (onToggleWishlist) {
      onToggleWishlist(item)
      return
    }
    onPress?.(item)
  }

  if (state === 'loading') {
    return <ProductCardSkeleton width={width} />
  }

  if (state === 'error') {
    return (
      <Card tone='subtle' radiusKey='xs' style={{ width }}>
        <Text tone='danger' variant='bodySm'>
          Unable to load product.
        </Text>
      </Card>
    )
  }

  if (state === 'empty' || !item) {
    return (
      <Card tone='subtle' radiusKey='xs' style={{ width }}>
        <Text tone='muted' variant='bodySm'>
          No product available.
        </Text>
      </Card>
    )
  }

  const isBundle = variant === 'bundle'
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
    disabled
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
  const addButtonLabel =
    addState === 'loading'
      ? 'Adding...'
      : addState === 'success'
      ? 'Added'
      : hasSelectableVariants
      ? 'Select options'
      : 'Add to cart'

  return (
    <Touchable
      key={item.id}
      disabled={disabled}
      onPress={() => onPress?.(item)}
      onPointerEnter={isWeb ? handlePointerEnter : undefined}
      onPointerLeave={isWeb ? handlePointerLeave : undefined}
    >
      <Card
        variant='flat'
        radiusKey='md'
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
            source={{ uri: imageUri }}
            style={
              {
                width: '100%',
                aspectRatio: 1,
                backgroundColor: isBundle ? colors.surface : colors.backgroundSecondary,
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

          {isNewProduct || badgeLabel || isLimitedProduct ? (
            <Box
              style={{
                position: 'absolute',
                top: spacing['12'],
                start: spacing['12'],
                gap: spacing['8'],
                alignItems: 'flex-start',
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
                  <Text variant='label' weight='700' tone='inverse' style={{ textTransform: 'uppercase' }}>
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
                    paddingHorizontal: hasDiscount ? spacing.sm : spacing['12'],
                    paddingVertical: hasDiscount ? spacing.sm : spacing.xs,
                  }}
                >
                  <Text
                    variant='label'
                    weight='700'
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
                  <Text variant='label' weight='700' tone='inverse' style={{ textTransform: 'uppercase' }}>
                    Limited
                  </Text>
                </Box>
              ) : null}
            </Box>
          ) : null}

          {!disabled ? (
            <Box
              style={{
                position: 'absolute',
                top: spacing['12'],
                end: spacing['12'],
              }}
            >
              <Touchable
                onPress={handleToggleWishlist}
                accessibilityRole='button'
                accessibilityLabel={`Add ${item.name} to wishlist`}
              >
                <Box
                  p='xxs'
                  bg='black'
                  style={{
                    borderWidth: borderWidth.thin,
                    borderColor: colors.black,
                  }}
                >
                  <Icon
                    name='wishlist'
                    size={spacing['16']}
                    color={localWishlisted ? colors.primary : colors.white}
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
                  transform: hovered ? [{ translateY: 0 }] : [{ translateY: spacing['8'] }],
                  transitionProperty: 'opacity, transform',
                  transitionDuration: `${hoverFadeDuration}ms`,
                  transitionTimingFunction: motionEasing.standard,
                } as any
              }
            >
              <Touchable
                disabled={!hovered}
                onPress={() => (onQuickView ? onQuickView(item) : onPress?.(item))}
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
                <Icon name='quickView' size={spacing['16']} color={colors.textPrimary} />
                <Text variant='bodySm' tone='default'>
                  Quick view
                </Text>
              </Touchable>
              <Touchable
                disabled={!hovered || addState === 'loading'}
                onPress={handleAddToCart}
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
                  variant='caption'
                  tone='inverse'
                  weight='700'
                  style={{ textTransform: 'uppercase' }}
                >
                  {addButtonLabel}
                </Text>
              </Touchable>
            </Box>
          ) : null}

          {showVariantPicker && !disabled ? (
            <Box
              style={{
                position: 'absolute',
                left: spacing['12'],
                right: spacing['12'],
                bottom: spacing['12'],
                borderWidth: borderWidth.thin,
                borderColor: colors.border,
                backgroundColor: colors.surface,
                gap: spacing['8'],
                padding: spacing['12'],
              }}
            >
              <Text variant='label' tone='default' style={{ textTransform: 'uppercase' }}>
                Select Shade
              </Text>
              <Box style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['8'], flexWrap: 'wrap' }}>
                {resolvedSwatches.map((swatch) => {
                  const selected = selectedSwatchId === swatch.id
                  return (
                    <Touchable
                      key={swatch.id}
                      onPress={() => setSelectedSwatchId(swatch.id)}
                      accessibilityRole='button'
                      accessibilityLabel={swatch.label ?? swatch.id}
                    >
                      <Box
                        style={{
                          width: spacing['16'] + spacing.xs,
                          height: spacing['16'] + spacing.xs,
                          borderRadius: radius.full,
                          backgroundColor: swatch.hex,
                          borderWidth: selected ? borderWidth.thick : borderWidth.thin,
                          borderColor: selected ? colors.textPrimary : colors.border,
                        }}
                      />
                    </Touchable>
                  )
                })}
              </Box>
              <Touchable onPress={handleAddToCart} style={{ alignSelf: 'flex-start' }}>
                <Box
                  style={{
                    minHeight: spacing['40'],
                    paddingHorizontal: spacing['12'],
                    borderWidth: borderWidth.thin,
                    borderColor: colors.black,
                    backgroundColor: colors.black,
                    justifyContent: 'center',
                  }}
                >
                  <Text variant='label' tone='inverse' weight='700' style={{ textTransform: 'uppercase' }}>
                    Confirm
                  </Text>
                </Box>
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
              variant='label'
              tone='muted'
              weight='700'
              numberOfLines={1}
              style={{ textTransform: 'uppercase' }}
            >
              {item.brand}
            </Text>
            <Text variant='bodySm' tone='muted' numberOfLines={2}>
              {item.name}
            </Text>
            {resolvedSwatches.length > 0 ? (
              <Box style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing['4'] }}>
                {resolvedSwatches.slice(0, 4).map((swatch) => (
                  <Box
                    key={swatch.id}
                    style={{
                      width: spacing['12'],
                      height: spacing['12'],
                      borderRadius: radius.full,
                      backgroundColor: swatch.hex,
                      borderWidth: borderWidth.thin,
                      borderColor: colors.border,
                    }}
                  />
                ))}
                {resolvedSwatches.length > 4 ? (
                  <Text variant='caption' tone='muted'>
                    +{resolvedSwatches.length - 4}
                  </Text>
                ) : null}
              </Box>
            ) : null}
          </Box>

          {ratingValue !== null ? (
            <StarRating value={ratingValue} reviewCount={reviewCount} size={12} />
          ) : null}

          <Box style={{ gap: spacing.sm, minHeight: spacing['32'] }}>
            <Box style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['8'] }}>
              <Text variant='price' size='3xl' tone='default' weight='700'>
                {formatCurrency(item.price)}
              </Text>
              {compareAtPrice && hasDiscount ? (
                <Text variant='caption' tone='danger' style={{ textDecorationLine: 'line-through' }}>
                  {formatCurrency(compareAtPrice)}
                </Text>
              ) : compareAtPrice ? (
                <Text variant='caption' tone='muted' style={{ textDecorationLine: 'line-through' }}>
                  {formatCurrency(compareAtPrice)}
                </Text>
              ) : null}
            </Box>
            {resolvedUrgencyLabel ? (
              <Text variant='label' tone='danger' style={{ textTransform: 'uppercase' }}>
                {resolvedUrgencyLabel}
              </Text>
            ) : null}
            {disabled ? (
              <Text variant='caption' tone='danger'>
                Out of stock
              </Text>
            ) : null}
          </Box>
        </Box>

        {!disabled && !isWeb ? (
          <Touchable
            onPress={handleAddToCart}
            disabled={addState === 'loading'}
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
            <Text variant='caption' tone='inverse' weight='700' style={{ textTransform: 'uppercase' }}>
              {addButtonLabel}
            </Text>
          </Touchable>
        ) : null}
      </Card>
    </Touchable>
  )
}

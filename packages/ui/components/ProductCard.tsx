import { useEffect, useMemo, useRef, useState } from 'react'
import { I18nManager, Image, Platform } from 'react-native'
import {
  borderWidth,
  colors,
  componentTokens,
  motionDuration,
  radius,
  shadows,
  spacing,
} from '@real/tokens'
import { Box, Text, Touchable } from '../primitives'
import { Badge } from './Badge'
import { Card } from './Card'
import { Icon } from './Icon'
import { StarRating } from './StarRating'
import { HomeProductItem } from './home/types'

type ProductCardVariant = 'default' | 'bundle' | 'flash'
type ProductCardState = 'loading' | 'empty' | 'error' | 'disabled' | 'default'
type ProductCardDensity = 'comfortable' | 'compact' | 'minimal'

type ProductCardProps = {
  item?: HomeProductItem
  variant?: ProductCardVariant
  density?: ProductCardDensity
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
  onShare?: (item: HomeProductItem) => void
  isWishlisted?: boolean
}

const FALLBACK_IMAGE = '/brand-logo-placeholder.svg'
const DEFAULT_CURRENCY = 'USD'
const DEFAULT_SWATCH_COLORS = [
  colors.brandPrimary,
  colors.info,
  colors.goldPrimary,
  colors.success,
  colors.textPrimary,
]

function ProductCardSkeleton({ width, density = 'comfortable' }: { width: number, density?: ProductCardDensity }) {
  const tokens = componentTokens.storefrontHome.productCard
  const densityTokens = componentTokens.storefrontHome.productCardDensity[density]
  const shimmer = {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radius.md,
  } as const

  return (
    <Card
      variant='flat'
      radiusKey='lg'
      style={{
        width,
        gap: densityTokens.cardGap,
        padding: 0,
        backgroundColor: colors.surface,
        borderWidth: tokens.shellBorderWidth,
        borderColor: tokens.shellBorderColor,
        overflow: 'hidden',
        ...(Platform.OS === 'web'
          ? ({
              boxShadow: tokens.shellShadowRest,
            } as const)
          : shadows.sm),
      }}
    >
      <Box
        style={{
          paddingHorizontal: densityTokens.contentPaddingX,
          paddingTop: densityTokens.contentPaddingY,
        }}
      >
        <Box
          style={{
            width: '100%',
            aspectRatio: densityTokens.mediaAspectRatio,
            backgroundColor: colors.backgroundSecondary,
            borderRadius: radius.md,
          }}
        />
      </Box>
      <Box
        style={{
          gap: densityTokens.contentGap,
          paddingHorizontal: densityTokens.contentPaddingX,
          paddingVertical: densityTokens.contentPaddingY,
        }}
      >
        <Box style={{ ...shimmer, height: densityTokens.brandLineHeight, width: '46%' }} />
        <Box style={{ ...shimmer, height: densityTokens.nameLineHeight, width: '92%' }} />
        <Box style={{ ...shimmer, height: densityTokens.nameLineHeight, width: '72%' }} />
        <Box style={{ ...shimmer, height: densityTokens.priceLineHeight, width: '58%' }} />
      </Box>
    </Card>
  )
}

export function ProductCard({
  item,
  variant = 'default',
  density = 'comfortable',
  width = spacing.xxl * 4,
  state = 'default',
  outOfStock = false,
  savingsLabel = 'Save 15%',
  urgencyLabel,
  onPress,
  onAddToCart,
  onQuickView,
  onToggleWishlist,
  onShare,
  isWishlisted = false,
}: ProductCardProps) {
  const tokens = componentTokens.storefrontHome.productCard
  const densityTokens = componentTokens.storefrontHome.productCardDensity[density]

  const [isHovering, setIsHovering] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false)
  const [addState, setAddState] = useState<'idle' | 'loading' | 'success'>('idle')
  const [localCartQuantity, setLocalCartQuantity] = useState(0)
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
  const supportsHover =
    Platform.OS === 'web'
      ? ((globalThis as { matchMedia?: (query: string) => { matches: boolean } })
          .matchMedia?.('(hover: hover) and (pointer: fine)')
          ?.matches ?? true)
      : false
  const hovered = isWeb && supportsHover ? isHovering : false

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

  const imageUri = resolvedSwatches[0]?.imageUrl || item?.imageUrl || FALLBACK_IMAGE
  const secondaryImageUri = resolvedSwatches[1]?.imageUrl || item?.hoverImageUrl || (resolvedSwatches.length > 1 ? imageUri : undefined)

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

  useEffect(() => {
    setLocalCartQuantity(0)
    setAddState('idle')
  }, [item?.id])

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
      currency: item.currency || DEFAULT_CURRENCY,
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
        setLocalCartQuantity((current) => current + 1)
      } finally {
        setAddState('success')
        resetAddTimeoutRef.current = setTimeout(() => {
          setAddState('idle')
        }, motionDuration.slow)
      }
    }, motionDuration.fast)
  }

  if (state === 'loading') {
    return <ProductCardSkeleton width={width} density={density} />
  }

  if (state === 'error') {
    return (
      <Card tone='subtle' radiusKey='md' style={{ width }}>
        <Text tone='danger' variant='bodySm'>
          Unable to load product.
        </Text>
      </Card>
    )
  }

  if (state === 'empty' || !item) {
    return (
      <Card tone='subtle' radiusKey='md' style={{ width }}>
        <Text tone='muted' variant='bodySm'>
          No product available.
        </Text>
      </Card>
    )
  }

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
    hasDiscount && discountPercent
      ? `-${discountPercent}%`
      : item.badge

  const isNewProduct = Boolean(item.isNew || item.badge?.toLowerCase().includes('new'))
  const isLimitedProduct = Boolean(item.isLimited || item.badge?.toLowerCase().includes('limited'))
  const ratingValue = typeof item.rating === 'number' ? Math.max(0, Math.min(5, item.rating)) : null
  const showRating = ratingValue !== null
  const interactionVisible = hovered || isFocused
  const showActionMenuToggle = !supportsHover && !disabled
  const showActionOverlayResolved = disabled
    ? false
    : supportsHover
      ? interactionVisible
      : isActionMenuOpen
  const quickActionsTopInset = showActionMenuToggle
    ? tokens.quickActionsInset + tokens.quickActionSize + tokens.quickActionsGap
    : tokens.quickActionsInset
  const buyButtonLabel =
    addState === 'loading'
      ? 'Adding…'
      : addState === 'success'
      ? 'Added'
      : 'Buy'
  const showsQuantityControl = localCartQuantity > 0
  const isRTL = I18nManager.isRTL
  const displayTitle = item.displayTitle || item.name
  const detailMeta = item.displaySubtitle || item.attributesList?.[0] || item.pricePerUnitLabel
  const normalizeLabel = (value?: string | null) => value?.trim().replace(/\s+/g, ' ').toLowerCase() ?? ''
  const supportingBadgeFromLabel = (label?: string | null) => {
    const normalized = normalizeLabel(label)
    if (!normalized) return null
    if (/limited|selling fast|low stock|exclusive|member/i.test(normalized)) {
      return { label: label!.trim(), tone: 'ink' as const, priority: 100 }
    }
    if (/bestseller|best seller|top rated|trending/i.test(normalized)) {
      return { label: label!.trim(), tone: 'ink' as const, priority: 90 }
    }
    if (/new|just dropped|back in stock|pre-?order/i.test(normalized)) {
      return { label: label!.trim(), tone: 'outline' as const, priority: 80 }
    }
    return null
  }

  const primaryBadge = hasDiscount && badgeLabel
    ? { label: badgeLabel, tone: 'accent' as const, priority: 200 }
    : null

  const supportingBadgeCandidates = [
    supportingBadgeFromLabel(urgencyLabel),
    supportingBadgeFromLabel(item.badge),
    !item.badge && isLimitedProduct ? { label: 'Limited', tone: 'ink' as const, priority: 100 } : null,
    !item.badge && isNewProduct ? { label: 'New', tone: 'outline' as const, priority: 80 } : null,
  ]
    .filter((badge): badge is { label: string; tone: 'ink' | 'outline'; priority: number } => Boolean(badge))
    .sort((left, right) => right.priority - left.priority)

  const mediaBadges = [
    ...(primaryBadge && !disabled ? [primaryBadge] : []),
    ...(!disabled
      ? supportingBadgeCandidates.filter((badge, index, array) =>
          index === array.findIndex((candidate) => normalizeLabel(candidate.label) === normalizeLabel(badge.label)),
        ).slice(0, primaryBadge ? 1 : 2)
      : []),
  ]

  const runQuickView = () => {
    if (!item || disabled) return
    setIsActionMenuOpen(false)
    if (onQuickView) {
      onQuickView(item)
      return
    }
    onPress?.(item)
  }

  const runToggleWishlist = () => {
    if (!item || disabled) return
    setIsActionMenuOpen(false)
    if (onToggleWishlist) {
      onToggleWishlist(item)
    }
  }

  const runShare = () => {
    if (!item || disabled) return
    setIsActionMenuOpen(false)
    if (onShare) {
      onShare(item)
      return
    }
    if (Platform.OS !== 'web') {
      return
    }
    const nav = (globalThis as { navigator?: { share?: (data: { title?: string; text?: string; url?: string }) => Promise<void> } }).navigator
    if (nav?.share) {
      void nav.share({
        title: item.name,
        text: item.name,
        url: item.href,
      })
    }
  }

  const runDecreaseQuantity = () => {
    if (disabled || addState === 'loading' || localCartQuantity <= 0) return
    setLocalCartQuantity((current) => {
      const nextQuantity = Math.max(0, current - 1)
      if (nextQuantity === 0) {
        setAddState('idle')
      }
      return nextQuantity
    })
  }

  const renderQuickActionLabel = (label: string, visible: boolean) => {
    if (Platform.OS !== 'web' || !visible) return null

    const labelOffset = densityTokens.quickActionSize + tokens.quickActionLabelGap
    const labelTopOffset = Math.max(0, (densityTokens.quickActionSize - densityTokens.quickActionLabelMinHeight) / 2)

    return (
      <Box
        style={{
          position: 'absolute',
          top: labelTopOffset,
          minHeight: densityTokens.quickActionLabelMinHeight,
          paddingHorizontal: tokens.quickActionLabelPaddingX,
          borderRadius: radius.full,
          borderWidth: borderWidth.none,
          borderColor: 'transparent',
          backgroundColor: colors.backgroundSecondary,
          justifyContent: 'center',
          zIndex: 1,
          ...(I18nManager.isRTL ? { start: labelOffset } : { end: labelOffset }),
          ...(Platform.OS === 'web' ? ({ boxShadow: 'none' } as const) : shadows.none),
        }}
      >
        <Text
          variant='caption'
          weight='600'
          style={{
            color: colors.textPrimary,
            fontSize: densityTokens.quickActionLabelFontSize,
            lineHeight: densityTokens.quickActionLabelLineHeight,
            letterSpacing: tokens.quickActionLabelTracking,
          }}
        >
          {label}
        </Text>
      </Box>
    )
  }

  const purchaseControl = showsQuantityControl ? (
    <Box
      style={{
        width: '100%',
        minHeight: densityTokens.buyActionHeight,
        borderRadius: radius.lg,
        borderWidth: borderWidth.thin,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        padding: tokens.quantityStepperInset,
        flexDirection: 'row',
        alignItems: 'center',
        gap: tokens.buyActionGap,
      }}
    >
      <Touchable
        onPress={runDecreaseQuantity}
        accessibilityRole='button'
        accessibilityLabel={`Decrease quantity. Current quantity ${localCartQuantity}`}
        disabled={disabled || addState === 'loading'}
      >
        {({ hovered: actionHovered, focused: actionFocused }) => {
          const active = actionHovered || actionFocused
          return (
            <Box
              style={{
                width: densityTokens.quantityStepperActionWidth,
                height: densityTokens.quantityStepperActionWidth,
                borderRadius: radius.md,
                backgroundColor: active ? colors.surfaceMuted : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
                transform: [{ scale: active ? 1.02 : 1 }],
                transitionProperty: 'background-color,transform',
                transitionDuration: `${motionDuration.hoverScale}ms`,
              }}
            >
              <Icon
                name={isRTL ? 'caretRight' : 'caretLeft'}
                size={densityTokens.buyActionIconSize}
                color={colors.textSecondary}
                weight='bold'
              />
            </Box>
          )
        }}
      </Touchable>

      <Box
        style={{
          minWidth: densityTokens.quantityChipMinWidth,
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text variant='caption' weight='700'>
          {localCartQuantity}
        </Text>
      </Box>

      <Touchable
        onPress={runAddToCart}
        accessibilityRole='button'
        accessibilityLabel={`Increase quantity. Current quantity ${localCartQuantity}`}
        disabled={disabled || addState === 'loading'}
      >
        {({ hovered: actionHovered, focused: actionFocused }) => {
          const active = actionHovered || actionFocused
          return (
            <Box
              style={{
                width: densityTokens.quantityStepperActionWidth,
                height: densityTokens.quantityStepperActionWidth,
                borderRadius: radius.md,
                backgroundColor: active ? colors.brandPrimaryHover : colors.brandPrimary,
                alignItems: 'center',
                justifyContent: 'center',
                transform: [{ scale: active ? 1.02 : 1 }],
                transitionProperty: 'background-color,transform',
                transitionDuration: `${motionDuration.hoverScale}ms`,
              }}
            >
              <Icon
                name={isRTL ? 'caretLeft' : 'caretRight'}
                size={densityTokens.buyActionIconSize}
                color={colors.white}
                weight='bold'
              />
            </Box>
          )
        }}
      </Touchable>
    </Box>
  ) : (
    <Touchable
      onPress={runAddToCart}
      accessibilityRole='button'
      accessibilityLabel={buyButtonLabel}
      disabled={disabled || addState === 'loading'}
    >
      {({ hovered: buyHovered, focused: buyFocused }) => {
        const buyActive = buyHovered || buyFocused
        return (
          <Box
            style={{
              width: '100%',
              minHeight: densityTokens.buyActionHeight,
              paddingHorizontal: spacing['14'],
              borderRadius: radius.lg,
              borderWidth: borderWidth.thin,
              borderColor: disabled ? colors.border : colors.brandPrimary,
              backgroundColor: disabled
                ? colors.backgroundSecondary
                : buyActive
                  ? colors.brandPrimaryHover
                  : colors.brandPrimary,
              alignItems: 'center',
              justifyContent: 'center',
              transform: [{ scale: buyActive ? 1.01 : 1 }],
              transitionProperty: 'background-color,transform',
              transitionDuration: `${motionDuration.hoverScale}ms`,
            }}
          >
            <Text
              variant='caption'
              weight='600'
              style={{
                color: disabled ? colors.textSecondary : colors.white,
                fontSize: densityTokens.buyActionTextSize,
                lineHeight: densityTokens.buyActionTextSize + 1,
                letterSpacing: tokens.buyActionTextTracking,
              }}
            >
              {disabled ? 'Out of stock' : 'Add to cart'}
            </Text>
          </Box>
        )
      }}
    </Touchable>
  )
  const bridgeOverlap = Math.round(densityTokens.buyActionHeight * 0.38)

  return (
    <Touchable
      key={item.id}
      disabled={disabled}
      onPress={() => onPress?.(item)}
      onPointerEnter={isWeb ? handlePointerEnter : undefined}
      onPointerLeave={isWeb ? handlePointerLeave : undefined}
      onFocus={() => setIsFocused(true)}
      onBlur={() => {
        setIsFocused(false)
        if (!supportsHover) {
          setIsActionMenuOpen(false)
        }
      }}
    >
      <Card
        variant='flat'
        radiusKey='lg'
        style={{
          width,
          gap: densityTokens.cardGap,
          padding: 0,
          backgroundColor: colors.surface,
          borderWidth: tokens.shellBorderWidth,
          borderColor: tokens.shellBorderColor,
          transform: [{ translateY: 0 }],
          transitionProperty: 'border-color',
          transitionDuration: `${motionDuration.hoverScale}ms`,
          ...(Platform.OS === 'web' ? ({ boxShadow: 'none' } as const) : shadows.none),
        }}
      >
        <Box
          style={{
            position: 'relative',
            paddingHorizontal: densityTokens.contentPaddingX,
            paddingTop: densityTokens.contentPaddingY,
          }}
        >
          <Box
            style={{
              width: '100%',
              aspectRatio: densityTokens.mediaAspectRatio,
              position: 'relative',
              backgroundColor: colors.backgroundSecondary,
              borderRadius: radius.md,
              overflow: 'hidden',
            }}
          >
            <Image
              source={{ uri: imageUri }}
              resizeMode='contain'
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: colors.backgroundSecondary,
                opacity: disabled ? 0.6 : hovered && secondaryImageUri ? 0 : 1,
                transform: [{ scale: 1 }],
                transitionProperty: 'opacity',
                transitionDuration: `${motionDuration.hoverScale}ms`,
              } as any}
            />
            {secondaryImageUri && !disabled ? (
              <Image
                source={{ uri: secondaryImageUri }}
                resizeMode='contain'
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  width: '100%',
                  height: '100%',
                  opacity: hovered ? 1 : 0,
                  transform: [{ scale: 1 }],
                  transitionProperty: 'opacity',
                  transitionDuration: `${motionDuration.hoverScale}ms`,
                } as any}
              />
            ) : null}

            {disabled ? (
              <Box
                style={{
                  position: 'absolute',
                  top: '50%',
                  start: spacing['8'],
                  end: spacing['8'],
                  minHeight: spacing['28'],
                  paddingHorizontal: spacing['10'],
                  borderRadius: radius.xs,
                  borderWidth: borderWidth.none,
                  borderColor: 'transparent',
                  backgroundColor: 'rgba(255,255,255,0.94)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: [{ translateY: -14 }],
                }}
              >
                <Text
                  variant='caption'
                  weight='600'
                  style={{
                    color: colors.brandPrimary,
                    textTransform: 'uppercase',
                    fontSize: densityTokens.quickActionLabelFontSize + 1,
                    lineHeight: densityTokens.quickActionLabelLineHeight + 1,
                    letterSpacing: 1.1,
                  }}
                >
                  Sold out
                </Text>
              </Box>
            ) : null}

          </Box>

          {mediaBadges.length > 0 ? (
            <Box
              style={{
                position: 'absolute',
                top: tokens.badgeTopInset,
                start: tokens.badgeSideInset,
                marginTop: densityTokens.contentPaddingY,
                marginStart: densityTokens.contentPaddingX,
                alignItems: 'flex-start',
                gap: spacing['4'],
              }}
            >
              {mediaBadges.map((badge) => (
                <Badge
                  key={`${item.id}-${badge.label}`}
                  tone={badge.tone}
                  size='sm'
                  style={{
                    transform: [{ scale: densityTokens.badgeScale }],
                  }}
                >
                  {badge.label}
                </Badge>
              ))}
            </Box>
          ) : null}

          {showActionMenuToggle ? (
            <Box
              style={{
                position: 'absolute',
                top: tokens.quickActionsInset + densityTokens.contentPaddingY,
                end: tokens.quickActionsInset + densityTokens.contentPaddingX,
              }}
            >
              <Touchable
                onPress={() => setIsActionMenuOpen((current) => !current)}
                accessibilityRole='button'
                accessibilityLabel={isActionMenuOpen ? 'Hide product actions' : 'Show product actions'}
              >
                {({ hovered: actionHovered, focused: actionFocused }) => {
                  const actionActive = isActionMenuOpen || actionHovered || actionFocused
                  return (
                    <Box
                      style={{
                        width: densityTokens.quickActionSize,
                        height: densityTokens.quickActionSize,
                        borderRadius: radius.full,
                        borderWidth: borderWidth.thin,
                        borderColor: actionActive ? colors.brandPrimary : colors.border,
                        backgroundColor: actionActive ? colors.brandPrimarySubtle : colors.surfaceMuted,
                        alignItems: 'center',
                        justifyContent: 'center',
                        transitionProperty: 'background-color,border-color,transform',
                        transitionDuration: `${motionDuration.microInteraction}ms`,
                        transform: [{ translateY: actionActive ? -1 : 0 }],
                      }}
                    >
                      <Icon
                        name='more'
                        size={densityTokens.quickActionIconSize}
                        color={actionActive ? colors.brandPrimary : colors.textPrimary}
                      />
                    </Box>
                  )
                }}
              </Touchable>
            </Box>
          ) : null}

          <Box
            pointerEvents={showActionOverlayResolved ? 'auto' : 'none'}
            style={{
              position: 'absolute',
              top: quickActionsTopInset + densityTokens.contentPaddingY,
              end: tokens.quickActionsInset + densityTokens.contentPaddingX,
              opacity: showActionOverlayResolved ? 1 : 0,
              transform: [{ translateX: showActionOverlayResolved ? 0 : tokens.quickActionsRevealOffsetX }],
              transitionProperty: 'opacity,transform',
              transitionDuration: `${motionDuration.microInteraction}ms`,
            }}
          >
            <Box
              style={{
                flexDirection: 'column',
                alignItems: 'center',
                gap: tokens.quickActionsGap,
              }}
            >
              <Touchable onPress={runQuickView} accessibilityRole='button' accessibilityLabel='Quick view'>
                {({ hovered: actionHovered, focused: actionFocused }) => {
                  const actionActive = actionHovered || actionFocused
                  return (
                    <Box
                      style={{
                        position: 'relative',
                        width: densityTokens.quickActionSize,
                        height: densityTokens.quickActionSize,
                      }}
                    >
                      {renderQuickActionLabel('Quick view', actionActive)}
                      <Box
                        style={{
                          width: densityTokens.quickActionSize,
                          height: densityTokens.quickActionSize,
                          borderRadius: radius.full,
                          borderWidth: borderWidth.thin,
                          borderColor: actionActive ? colors.brandPrimary : colors.border,
                          backgroundColor: actionActive ? colors.brandPrimarySubtle : colors.surfaceMuted,
                          alignItems: 'center',
                          justifyContent: 'center',
                          transform: [{ translateY: actionActive ? -1 : 0 }],
                          transitionProperty: 'background-color,border-color,transform',
                          transitionDuration: `${motionDuration.microInteraction}ms`,
                          ...(Platform.OS === 'web' ? ({ boxShadow: 'none' } as const) : shadows.none),
                        }}
                      >
                        <Icon
                          name='quickView'
                          size={densityTokens.quickActionIconSize}
                          color={actionActive ? colors.brandPrimary : colors.textPrimary}
                        />
                      </Box>
                    </Box>
                  )
                }}
              </Touchable>

              <Touchable onPress={runToggleWishlist} accessibilityRole='button' accessibilityLabel='Favorite'>
                {({ hovered: actionHovered, focused: actionFocused }) => {
                  const actionActive = actionHovered || actionFocused || isWishlisted
                  return (
                    <Box
                      style={{
                        position: 'relative',
                        width: densityTokens.quickActionSize,
                        height: densityTokens.quickActionSize,
                      }}
                    >
                      {renderQuickActionLabel('Favorite', actionHovered || actionFocused)}
                      <Box
                        style={{
                          width: densityTokens.quickActionSize,
                          height: densityTokens.quickActionSize,
                          borderRadius: radius.full,
                          borderWidth: borderWidth.thin,
                          borderColor: actionHovered || actionFocused ? colors.brandPrimary : colors.border,
                          backgroundColor: actionHovered || actionFocused ? colors.brandPrimarySubtle : colors.surfaceMuted,
                          alignItems: 'center',
                          justifyContent: 'center',
                          transform: [{ translateY: actionHovered || actionFocused ? -1 : 0 }],
                          transitionProperty: 'background-color,border-color,transform',
                          transitionDuration: `${motionDuration.microInteraction}ms`,
                          ...(Platform.OS === 'web' ? ({ boxShadow: 'none' } as const) : shadows.none),
                        }}
                      >
                        <Icon
                          name='wishlist'
                          size={densityTokens.quickActionIconSize}
                          color={isWishlisted || actionHovered || actionFocused ? colors.brandPrimary : colors.textPrimary}
                          weight={isWishlisted ? 'fill' : 'regular'}
                        />
                      </Box>
                    </Box>
                  )
                }}
              </Touchable>

              <Touchable onPress={runShare} accessibilityRole='button' accessibilityLabel='Share'>
                {({ hovered: actionHovered, focused: actionFocused }) => {
                  const actionActive = actionHovered || actionFocused
                  return (
                    <Box
                      style={{
                        position: 'relative',
                        width: densityTokens.quickActionSize,
                        height: densityTokens.quickActionSize,
                      }}
                    >
                      {renderQuickActionLabel('Share', actionActive)}
                      <Box
                        style={{
                          width: densityTokens.quickActionSize,
                          height: densityTokens.quickActionSize,
                          borderRadius: radius.full,
                          borderWidth: borderWidth.thin,
                          borderColor: actionActive ? colors.brandPrimary : colors.border,
                          backgroundColor: actionActive ? colors.brandPrimarySubtle : colors.surfaceMuted,
                          alignItems: 'center',
                          justifyContent: 'center',
                          transform: [{ translateY: actionActive ? -1 : 0 }],
                          transitionProperty: 'background-color,border-color,transform',
                          transitionDuration: `${motionDuration.microInteraction}ms`,
                          ...(Platform.OS === 'web' ? ({ boxShadow: 'none' } as const) : shadows.none),
                        }}
                      >
                        <Icon
                          name='trendArrow'
                          size={densityTokens.quickActionIconSize}
                          color={actionActive ? colors.brandPrimary : colors.textPrimary}
                        />
                      </Box>
                    </Box>
                  )
                }}
              </Touchable>
            </Box>
          </Box>

        </Box>

        <Box
          style={{
            marginTop: -bridgeOverlap,
            paddingHorizontal: densityTokens.contentPaddingX + spacing['2'],
            zIndex: 2,
          }}
        >
          {purchaseControl}
        </Box>

        <Box
          style={{
            gap: densityTokens.contentGap,
            paddingHorizontal: densityTokens.contentPaddingX,
            paddingTop: densityTokens.contentPaddingY + spacing['2'],
            paddingBottom: densityTokens.contentPaddingY,
          }}
        >
          <Text
            variant='meta'
            tone='muted'
            weight='600'
            numberOfLines={1}
            style={{
              textTransform: 'uppercase',
              fontSize: densityTokens.brandFontSize,
              lineHeight: densityTokens.brandLineHeight,
              letterSpacing: tokens.brandTracking,
            }}
          >
            {item.brand}
          </Text>

          <Text
            tone='default'
            numberOfLines={2}
            weight='600'
            style={{
              fontSize: densityTokens.nameFontSize,
              lineHeight: densityTokens.nameLineHeight,
              minHeight: densityTokens.nameMinHeight,
            }}
          >
            {displayTitle}
          </Text>

          {detailMeta ? (
            <Text
              tone='muted'
              numberOfLines={1}
              style={{
                fontSize: tokens.subtitleFontSize,
                lineHeight: tokens.subtitleLineHeight,
                minHeight: tokens.subtitleMinHeight,
              }}
            >
              {detailMeta}
            </Text>
          ) : null}

          {showRating && density !== 'minimal' ? (
            <Box style={{ minHeight: tokens.ratingMinHeight, justifyContent: 'center' }}>
              <StarRating
                value={ratingValue}
                size={densityTokens.ratingSize}
                color={colors.goldPrimary}
              />
            </Box>
          ) : null}

          <Box
            style={{
              minHeight: tokens.priceRowMinHeight,
              alignItems: isRTL ? 'flex-end' : 'flex-start',
              justifyContent: 'center',
            }}
          >
            <Box
              style={{
                alignItems: isRTL ? 'flex-end' : 'flex-start',
                justifyContent: 'center',
              }}
            >
              <Box
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: tokens.priceGap,
                  flexWrap: 'wrap',
                  alignSelf: isRTL ? 'flex-end' : 'flex-start',
                }}
              >
                <Text
                  tone={hasDiscount ? 'danger' : 'default'}
                  weight='700'
                  style={{
                    fontSize: densityTokens.priceFontSize,
                    lineHeight: densityTokens.priceLineHeight,
                  }}
                >
                  {formatCurrency(item.price)}
                </Text>
                {compareAtPrice ? (
                  <Text
                    tone='muted'
                    style={{
                      textDecorationLine: 'line-through',
                      fontSize: densityTokens.compareFontSize,
                      lineHeight: densityTokens.compareLineHeight,
                    }}
                  >
                    {formatCurrency(compareAtPrice)}
                  </Text>
                ) : null}
              </Box>
            </Box>
          </Box>

        </Box>
      </Card>
    </Touchable>
  )
}

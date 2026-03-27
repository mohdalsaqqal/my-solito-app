"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import { I18nManager, Image, Platform, ScrollView, View } from 'react-native'
import { borderWidth, colors, elevation, motionDuration, radius, spacing, zIndex } from '@real/tokens'
import { Box, Text, Touchable } from '../../primitives'
import { Button } from '../Button'
import { Card } from '../Card'
import { Icon } from '../Icon'

export type CartDrawerItem = {
  id: string
  name: string
  quantity: number
  price: number
  currency: string
  imageUrl?: string
  brand?: string
}

type CartDrawerProps = {
  open: boolean
  items: CartDrawerItem[]
  subtotal: number
  loading?: boolean
  error?: string | null
  onClose: () => void
  onIncrease?: (item: CartDrawerItem) => void | Promise<void>
  onDecrease?: (item: CartDrawerItem) => void | Promise<void>
  onRemove?: (item: CartDrawerItem) => void | Promise<void>
  onViewCart: () => void
  onCheckout: () => void
}

const FALLBACK_IMAGE = '/brand-logo-placeholder.svg'

export function CartDrawer({
  open,
  items,
  subtotal,
  loading = false,
  error,
  onClose,
  onIncrease,
  onDecrease,
  onRemove,
  onViewCart,
  onCheckout,
}: CartDrawerProps) {
  const formatCurrency = (value: number, currencyCode: string) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)

  const [pendingById, setPendingById] = useState<Record<string, boolean>>({})
  const [actionById, setActionById] = useState<Record<string, 'updating' | 'removing' | undefined>>({})
  const previousActiveRef = useRef<HTMLElement | null>(null)
  const panelRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open || Platform.OS !== 'web') {
      return
    }

    const doc = (globalThis as { document?: Document }).document
    if (!doc) {
      return
    }

    previousActiveRef.current = doc.activeElement instanceof HTMLElement ? doc.activeElement : null
    const closeEl = doc.getElementById('cart-drawer-close')
    if (closeEl instanceof HTMLElement) {
      closeEl.focus()
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key !== 'Tab') {
        return
      }
      const panel = panelRef.current
      if (!panel) {
        return
      }
      const focusables = Array.from(
        panel.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.hasAttribute('disabled') && el.tabIndex !== -1)
      if (focusables.length === 0) {
        event.preventDefault()
        return
      }
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (!first || !last) {
        event.preventDefault()
        return
      }
      const active = doc.activeElement
      if (event.shiftKey) {
        if (active === first || !panel.contains(active)) {
          event.preventDefault()
          last.focus()
        }
        return
      }
      if (active === last || !panel.contains(active)) {
        event.preventDefault()
        first.focus()
      }
    }

    doc.addEventListener('keydown', onKeyDown)
    return () => {
      doc.removeEventListener('keydown', onKeyDown)
      if (previousActiveRef.current) {
        previousActiveRef.current.focus()
      }
    }
  }, [open, onClose])

  const totalQuantity = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items])

  const runMutation = async (
    item: CartDrawerItem,
    action: 'updating' | 'removing',
    mutate?: (target: CartDrawerItem) => void | Promise<void>
  ) => {
    if (!mutate || pendingById[item.id]) {
      return
    }
    setPendingById((current) => ({ ...current, [item.id]: true }))
    setActionById((current) => ({ ...current, [item.id]: action }))
    try {
      await mutate(item)
    } finally {
      setPendingById((current) => ({ ...current, [item.id]: false }))
      setActionById((current) => ({ ...current, [item.id]: undefined }))
    }
  }

  if (!open || Platform.OS !== 'web') {
    return null
  }

  const isRtl =
    Platform.OS === 'web'
      ? (((globalThis as { document?: { documentElement?: { dir?: string } } }).document?.documentElement?.dir ??
          (I18nManager.isRTL ? 'rtl' : 'ltr')) === 'rtl')
      : I18nManager.isRTL
  const currency = items[0]?.currency ?? 'USD'
  const freeDeliveryTarget = 99
  const amountToFreeDelivery = Math.max(0, freeDeliveryTarget - subtotal)
  const freeDeliveryProgress = Math.max(0, Math.min(1, subtotal / freeDeliveryTarget))

  return (
    <Box
      data-ect-node="CartDrawer"
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: zIndex.searchTop + 4,
      } as any}
    >
      <Touchable
        onPress={onClose}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          backgroundColor: colors.black,
          opacity: 0.32,
          transitionProperty: 'opacity',
          transitionDuration: `${motionDuration.pageReveal}ms`,
        } as any}
      />

      <View
        ref={(node) => {
          if (Platform.OS === 'web') {
            panelRef.current = node as unknown as HTMLElement
          }
        }}
        accessibilityRole='dialog'
        accessibilityLabel='Cart drawer'
        style={{
          position: 'absolute',
          top: 0,
          [isRtl ? 'left' : 'right']: 0,
          bottom: 0,
          width: spacing.xxl * 9.6,
          maxWidth: '92%' as any,
          backgroundColor: colors.surface,
          [isRtl ? 'borderRightWidth' : 'borderLeftWidth']: borderWidth.thin,
          borderColor: colors.border,
          flexDirection: 'column',
          ...(Platform.OS === 'web'
            ? {
                boxShadow: elevation.drawerPanel,
              }
            : {}),
        } as any}
      >
        {/* Header */}
        <Box
          style={{
            paddingHorizontal: spacing['12'],
            paddingTop: spacing['4'],
            paddingBottom: spacing['3'],
            borderBottomWidth: borderWidth.thin,
            borderBottomColor: colors.border,
            backgroundColor: colors.surface,
          }}
        >
          <Box style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Touchable
              nativeID='cart-drawer-close'
              accessibilityRole='button'
              onPress={onClose}
            >
              {({ hovered, focused }) => (
                <Box
                  style={{
                    width: spacing['32'],
                    height: spacing['32'],
                    borderRadius: radius.full,
                    backgroundColor: hovered || focused ? colors.surfaceMuted : colors.surface,
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: hovered || focused ? 1 : 0.72,
                  }}
                >
                  <Icon name='close' size={16} />
                </Box>
              )}
            </Touchable>
            <Text variant='title' size={15} weight='700'>
              Bag
              <Text variant='caption' tone='muted' style={{ letterSpacing: 0.2 }}>
                {' '}
                ({totalQuantity} item{totalQuantity === 1 ? '' : 's'})
              </Text>
            </Text>
            <Box style={{ width: spacing['32'], height: spacing['32'] }} />
          </Box>
        </Box>

        {/* Free Delivery Progress */}
        {items.length > 0 ? (
          <Box
            style={{
              paddingHorizontal: spacing['16'],
              paddingVertical: spacing['6'],
              borderBottomWidth: borderWidth.thin,
              borderBottomColor: colors.border,
              backgroundColor: colors.surface,
            }}
          >
            <Box
              style={{
                paddingHorizontal: spacing['4'],
                paddingVertical: spacing['2'],
                backgroundColor: colors.surface,
                gap: spacing['4'],
              }}
            >
              <Box
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: spacing['8'],
                }}
              >
                <Box style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['6'], flex: 1 }}>
                  <Icon name='shipping' size={14} color={colors.textSecondary} />
                  <Text variant='bodySm' tone='muted' weight='500' numberOfLines={1} style={{ flex: 1 }}>
                    {amountToFreeDelivery > 0
                      ? `Add ${formatCurrency(amountToFreeDelivery, currency)} for free delivery`
                      : 'You unlocked free delivery'}
                  </Text>
                </Box>
                {amountToFreeDelivery > 0 ? (
                  <Touchable
                    onPress={() => {
                      onViewCart()
                      onClose()
                    }}
                    accessibilityRole='button'
                    accessibilityLabel='Add more items for free delivery'
                  >
                    {({ hovered }) => (
                      <Box
                        style={{
                          minHeight: spacing['24'],
                          borderRadius: radius.full,
                          paddingHorizontal: spacing['8'],
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: hovered ? colors.brandPrimarySubtle : colors.surfaceMuted,
                          borderWidth: borderWidth.thin,
                          borderColor: hovered ? colors.brandPrimary : colors.border,
                        }}
                      >
                    <Text variant='caption' weight='700' tone='primary'>
                      Add more
                    </Text>
                      </Box>
                    )}
                  </Touchable>
                ) : null}
              </Box>
              <Box
                style={{
                  height: spacing['1'],
                  borderRadius: radius.full,
                  backgroundColor: colors.surfaceMuted,
                  overflow: 'hidden',
                }}
              >
                <Box
                  style={{
                    height: '100%',
                    width: `${Math.round(freeDeliveryProgress * 100)}%`,
                    backgroundColor: colors.brandPrimary,
                  }}
                />
              </Box>
            </Box>
          </Box>
        ) : null}

        {/* Scrollable Content */}
        <ScrollView
          style={{ flex: 1, backgroundColor: colors.surface }}
          contentContainerStyle={{ padding: spacing['12'], paddingBottom: spacing['16'] }}
        >
          {loading ? (
            <Box style={{ gap: spacing['16'] }}>
              <Card tone='subtle' radiusKey='md' style={{ minHeight: spacing.xxl * 2 }} />
              <Card tone='subtle' radiusKey='md' style={{ minHeight: spacing.xxl * 2 }} />
            </Box>
          ) : error ? (
            <Box style={{ flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 200, gap: spacing.sm }}>
              <Icon name='unknown' size={32} color={colors.textSecondary} />
              <Text tone='danger' weight='600'>Unable to load cart.</Text>
              <Text tone='muted' variant='bodySm'>{error}</Text>
            </Box>
          ) : items.length === 0 ? (
            <Box style={{ flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: spacing.lg }}>
              <Icon name='cart' size={48} color={colors.border} />
              <Text tone='muted' variant='title' weight='600'>Your cart is empty.</Text>
              <Button
                variant='solid'
                onPress={() => {
                  onViewCart()
                  onClose()
                }}
              >
                Start Shopping
              </Button>
            </Box>
          ) : (
            <Box style={{ gap: spacing['10'] }}>
              {items.map((item) => (
                <Box
                  key={item.id}
                  style={{
                    flexDirection: 'row',
                    gap: spacing['8'],
                    paddingVertical: spacing['8'],
                    borderRadius: radius.sm,
                    backgroundColor: colors.surface,
                    borderBottomWidth: borderWidth.thin,
                    borderBottomColor: colors.stroke,
                  }}
                >
                  {/* Thumbnail */}
                  <Box
                    style={{
                      width: 52,
                      height: 64,
                      borderRadius: radius.sm,
                      backgroundColor: colors.backgroundSecondary,
                      borderWidth: borderWidth.thin,
                      borderColor: colors.border,
                      overflow: 'hidden',
                    }}
                  >
                    <Image
                      source={{ uri: item.imageUrl || FALLBACK_IMAGE }}
                      alt={item.name}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode='cover'
                    />
                  </Box>

                  {/* Details */}
                  <Box style={{ flex: 1, justifyContent: 'space-between', gap: spacing['4'] }}>
                    <Box style={{ gap: spacing['2'] }}>
                      {item.brand ? (
                        <Text
                          variant='caption'
                          size={10}
                          tone='muted'
                          weight='600'
                          style={{ textTransform: 'uppercase', letterSpacing: 0.6 }}
                        >
                          {item.brand}
                        </Text>
                      ) : null}
                      <Text variant='bodySm' weight='400' numberOfLines={2}>
                        {item.name}
                      </Text>
                    </Box>

                    {/* Quantity & Price Row */}
                    <Box style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing['8'] }}>

                      {/* Pill Quantity Selector */}
                      <Box style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['2'] }}>
                        <Box
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            borderWidth: borderWidth.thin,
                            borderColor: colors.border,
                            borderRadius: radius.full,
                            backgroundColor: colors.surfaceMuted,
                            height: 32,
                          }}
                        >
                          <Touchable
                            onPress={() => runMutation(item, 'updating', onDecrease)}
                            disabled={pendingById[item.id]}
                            style={{ width: 28, height: '100%', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <Text variant='caption' tone='muted' weight='700'>−</Text>
                          </Touchable>
                          <Box style={{ minWidth: 20, alignItems: 'center', justifyContent: 'center' }}>
                            <Text variant='caption' weight='700'>{item.quantity}</Text>
                          </Box>
                          <Touchable
                            onPress={() => runMutation(item, 'updating', onIncrease)}
                            disabled={pendingById[item.id]}
                            style={{ width: 28, height: '100%', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <Text variant='caption' tone='muted' weight='700'>+</Text>
                          </Touchable>
                        </Box>

                        <Touchable
                          onPress={() => runMutation(item, 'removing', onRemove)}
                          disabled={pendingById[item.id]}
                          accessibilityLabel='Delete item from cart'
                        >
                          {({ hovered }) => (
                            <Box
                              style={{
                                width: spacing['24'],
                                height: spacing['24'],
                                borderRadius: radius.full,
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: hovered ? colors.brandPrimarySubtle : colors.surface,
                              }}
                            >
                              <Icon
                                name='delete'
                                size={14}
                                color={hovered ? colors.error : colors.textSecondary}
                              />
                            </Box>
                          )}
                        </Touchable>
                      </Box>

                      <Box style={{ alignItems: 'flex-end' }}>
                        {pendingById[item.id] ? (
                          <Text variant='caption' size={10} tone='muted' style={{ marginBottom: 2 }}>
                            {actionById[item.id] === 'removing' ? 'Removing...' : 'Updating...'}
                          </Text>
                        ) : null}
                        <Text variant='bodySm' weight='700'>
                          {formatCurrency(item.price * item.quantity, item.currency)}
                        </Text>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </ScrollView>

        {/* Sticky Footer */}
        {items.length > 0 && !loading && !error && (
          <Box
            style={{
              paddingHorizontal: spacing['12'],
              paddingTop: spacing['8'],
              paddingBottom: spacing['10'],
              backgroundColor: colors.surface,
              borderTopWidth: borderWidth.thin,
              borderTopColor: colors.border,
            }}
          >
            <Box style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing['8'] }}>
              <Text variant='bodySm' tone='muted'>Estimated Total</Text>
              <Text variant='title' size={18} weight='700'>{formatCurrency(subtotal, currency)}</Text>
            </Box>
            <Button
              variant='solid'
              size='sm'
              fullWidth
              onPress={() => {
                onCheckout()
                onClose()
              }}
            >
              Checkout
            </Button>
            <Box style={{ alignItems: 'center', marginTop: spacing['6'] }}>
              <Touchable
                onPress={() => {
                  onViewCart()
                  onClose()
                }}
                accessibilityRole='button'
                accessibilityLabel='View full cart'
              >
                {({ hovered }) => (
                  <Text variant='bodySm' tone='muted' style={{ textDecorationLine: hovered ? 'underline' : 'none' }}>
                    View full cart
                  </Text>
                )}
              </Touchable>
            </Box>
          </Box>
        )}
      </View>
    </Box>
  )
}

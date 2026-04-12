"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { I18nManager, Image, Platform, ScrollView, View } from 'react-native'
import { borderWidth, elevation, motionDuration, radius, spacing, zIndex } from '@real/tokens'
import { Box, Text } from '../../primitives'
import { Button as ReusableButton } from '../../reusables/button'
import { Button } from '../Button'
import { Card } from '../Card'
import { Icon } from '../Icon'
import { IconButton } from '../IconButton'
import { useThemeColors } from '../../responsive'

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
  freeDeliveryThreshold?: number
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

const currencyFormatterCache = new Map<string, Intl.NumberFormat>()

function getCurrencyFormatter(currencyCode: string): Intl.NumberFormat {
  let fmt = currencyFormatterCache.get(currencyCode)
  if (!fmt) {
    fmt = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    currencyFormatterCache.set(currencyCode, fmt)
  }
  return fmt
}

export const CartDrawer = React.memo(function CartDrawer({
  open,
  items,
  subtotal,
  freeDeliveryThreshold = 99,
  loading = false,
  error,
  onClose,
  onIncrease,
  onDecrease,
  onRemove,
  onViewCart,
  onCheckout,
}: CartDrawerProps) {
  const c = useThemeColors()
  const formatCurrency = useCallback(
    (value: number, currencyCode: string) => getCurrencyFormatter(currencyCode).format(value),
    [],
  )

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

  useEffect(() => {
    if (!open || Platform.OS !== 'web') {
      return
    }

    const doc = (globalThis as { document?: Document }).document
    const body = doc?.body
    const root = doc?.documentElement

    if (!body || !root) {
      return
    }

    const previousBodyOverflow = body.style.overflow
    const previousRootOverflow = root.style.overflow

    body.style.overflow = 'hidden'
    root.style.overflow = 'hidden'

    return () => {
      body.style.overflow = previousBodyOverflow
      root.style.overflow = previousRootOverflow
    }
  }, [open])

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
  const freeDeliveryTarget = freeDeliveryThreshold
  const amountToFreeDelivery = Math.max(0, freeDeliveryTarget - subtotal)
  const freeDeliveryProgress = Math.max(0, Math.min(1, subtotal / freeDeliveryTarget))

  return (
    <div
      data-ect-node="CartDrawer"
      role='dialog'
      aria-modal='true'
      aria-label='Cart drawer'
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: zIndex.searchTop + 4,
      }}
    >
      <div
        aria-hidden='true'
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          backgroundColor: c.inkBlack,
          opacity: 0.38,
          cursor: 'pointer',
        }}
      />

      <View
        ref={(node) => {
          if (Platform.OS === 'web') {
            panelRef.current = node as unknown as HTMLElement
          }
        }}
        style={{
          position: 'absolute',
          top: 0,
          [isRtl ? 'left' : 'right']: 0,
          bottom: 0,
          width: spacing.xxl * 9.6,
          maxWidth: '92%' as any,
          backgroundColor: c.surface,
          [isRtl ? 'borderRightWidth' : 'borderLeftWidth']: borderWidth.thin,
          borderColor: c.border,
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
            borderBottomColor: c.border,
            backgroundColor: c.surface,
          }}
        >
          <Box style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box id='cart-drawer-close' style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
              <IconButton
                icon='close'
                label='Close cart drawer'
                onPress={onClose}
                tone='ghost'
              />
            </Box>
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
              borderBottomColor: c.border,
              backgroundColor: c.surface,
            }}
          >
            <Box
              style={{
                paddingHorizontal: spacing['4'],
                paddingVertical: spacing['2'],
                backgroundColor: c.surface,
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
                  <Icon name='shipping' size={14} color={c.textSecondary} />
                  <Text variant='bodySm' tone='muted' weight='500' numberOfLines={1} style={{ flex: 1 }}>
                    {amountToFreeDelivery > 0
                      ? `Add ${formatCurrency(amountToFreeDelivery, currency)} for free delivery`
                      : 'You unlocked free delivery'}
                  </Text>
                </Box>
                {amountToFreeDelivery > 0 ? (
                  <ReusableButton
                    onPress={() => {
                      onViewCart()
                      onClose()
                    }}
                    accessibilityLabel='Add more items for free delivery'
                    variant='ghost'
                    size='sm'
                    style={{
                      minHeight: spacing['24'],
                      borderRadius: radius.full,
                      paddingHorizontal: spacing['8'],
                      backgroundColor: c.surfaceMuted,
                      borderWidth: borderWidth.thin,
                      borderColor: c.border,
                    }}
                  >
                    <Text variant='caption' weight='700' tone='primary'>
                      Add more
                    </Text>
                  </ReusableButton>
                ) : null}
              </Box>
              <Box
                style={{
                  height: spacing['1'],
                  borderRadius: radius.full,
                  backgroundColor: c.surfaceMuted,
                  overflow: 'hidden',
                }}
              >
                <Box
                  style={{
                    height: '100%',
                    backgroundColor: c.brandPrimary,
                    transformOrigin: 'left',
                    transform: [{ scaleX: freeDeliveryProgress }],
                  }}
                />
              </Box>
            </Box>
          </Box>
        ) : null}

        {/* Scrollable Content */}
        <ScrollView
          style={{ flex: 1, backgroundColor: c.surface }}
          contentContainerStyle={{ padding: spacing['12'], paddingBottom: spacing['16'] }}
        >
          {loading ? (
            <Box style={{ gap: spacing['16'] }}>
              <Card tone='subtle' radiusKey='md' style={{ minHeight: spacing.xxl * 2 }} />
              <Card tone='subtle' radiusKey='md' style={{ minHeight: spacing.xxl * 2 }} />
            </Box>
          ) : error ? (
            <Box style={{ flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 200, gap: spacing.sm }}>
              <Icon name='unknown' size={32} color={c.textSecondary} />
              <Text tone='danger' weight='600'>Unable to load cart.</Text>
              <Text tone='muted' variant='bodySm'>{error}</Text>
            </Box>
          ) : items.length === 0 ? (
            <Box style={{ flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: spacing.lg }}>
              <Icon name='cart' size={48} color={c.border} />
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
                    backgroundColor: c.surface,
                    borderBottomWidth: borderWidth.thin,
                    borderBottomColor: c.stroke,
                  }}
                >
                  {/* Thumbnail */}
                  <Box
                    style={{
                      width: 52,
                      height: 64,
                      borderRadius: radius.sm,
                      backgroundColor: c.backgroundSecondary,
                      borderWidth: borderWidth.thin,
                      borderColor: c.border,
                      overflow: 'hidden',
                    }}
                  >
                    <Image
                      source={{ uri: item.imageUrl || FALLBACK_IMAGE }}
                      alt={item.name}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode='cover'
                      {...(Platform.OS === 'web' ? { loading: 'lazy' } : {})}
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
                            borderColor: c.border,
                            borderRadius: radius.full,
                            backgroundColor: c.surfaceMuted,
                          }}
                        >
                          <ReusableButton
                            onPress={() => runMutation(item, 'updating', onDecrease)}
                            disabled={pendingById[item.id]}
                            accessibilityLabel='Decrease quantity'
                            accessibilityRole='button'
                            variant='ghost'
                            size='icon'
                            style={{ width: 44, height: 44, minWidth: 44, minHeight: 44, paddingHorizontal: 0, paddingVertical: 0, alignItems: 'center', justifyContent: 'center' }}
                          >
                            <Text variant='caption' tone='muted' weight='700'>-</Text>
                          </ReusableButton>
                          <Box style={{ minWidth: 20, alignItems: 'center', justifyContent: 'center' }}>
                            <Text variant='caption' weight='700'>{item.quantity}</Text>
                          </Box>
                          <ReusableButton
                            onPress={() => runMutation(item, 'updating', onIncrease)}
                            disabled={pendingById[item.id]}
                            accessibilityLabel='Increase quantity'
                            accessibilityRole='button'
                            variant='ghost'
                            size='icon'
                            style={{ width: 44, height: 44, minWidth: 44, minHeight: 44, paddingHorizontal: 0, paddingVertical: 0, alignItems: 'center', justifyContent: 'center' }}
                          >
                            <Text variant='caption' tone='muted' weight='700'>+</Text>
                          </ReusableButton>
                        </Box>

                        <ReusableButton
                          onPress={() => runMutation(item, 'removing', onRemove)}
                          disabled={pendingById[item.id]}
                          accessibilityLabel='Delete item from cart'
                          accessibilityRole='button'
                          variant='ghost'
                          size='icon'
                          style={{
                            width: 44,
                            height: 44,
                            minWidth: 44,
                            minHeight: 44,
                            paddingHorizontal: 0,
                            paddingVertical: 0,
                            borderRadius: radius.full,
                            backgroundColor: c.surface,
                          }}
                        >
                          <Icon
                            name='delete'
                            size={14}
                            color={c.textSecondary}
                          />
                        </ReusableButton>
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
              backgroundColor: c.surface,
              borderTopWidth: borderWidth.thin,
              borderTopColor: c.border,
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
              <ReusableButton
                onPress={() => {
                  onViewCart()
                  onClose()
                }}
                accessibilityLabel='View full cart'
                variant='link'
                size='sm'
                style={{
                  paddingHorizontal: 0,
                  paddingVertical: 0,
                }}
              >
                <Text variant='bodySm' tone='muted' style={{ textDecorationLine: 'underline' }}>
                  View full cart
                </Text>
              </ReusableButton>
            </Box>
          </Box>
        )}
      </View>
    </div>
  )
})

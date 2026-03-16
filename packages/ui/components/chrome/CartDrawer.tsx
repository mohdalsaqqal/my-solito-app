import { useEffect, useMemo, useRef, useState } from 'react'
import { Image, Platform, ScrollView, View } from 'react-native'
import { borderWidth, colors, elevation, motionDuration, motionEasing, radius, spacing, zIndex } from '@real/tokens'
import { Box, Divider, Text, Touchable } from '../../primitives'
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

  const currency = items[0]?.currency ?? 'USD'

  return (
    <Box
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
          opacity: 0.4,
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
          right: 0,
          bottom: 0,
          width: spacing.xxl * 9,
          maxWidth: '92%' as any,
          backgroundColor: colors.surface,
          borderLeftWidth: borderWidth.thin,
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
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: spacing['16'],
            paddingVertical: spacing['16'],
            borderBottomWidth: borderWidth.thin,
            borderBottomColor: colors.border,
            backgroundColor: colors.surface,
          }}
        >
          <Text variant='title' size={18} weight='700'>
            Your Cart {items.length > 0 ? `(${items.length})` : ''}
          </Text>
          <Touchable
            nativeID='cart-drawer-close'
            accessibilityRole='button'
            onPress={onClose}
            style={{
              width: spacing['32'],
              height: spacing['32'],
              borderRadius: radius.full,
              backgroundColor: colors.backgroundSecondary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {({ hovered }) => (
              <Box style={{ opacity: hovered ? 1 : 0.7 }}>
                <Icon name='close' size={16} />
              </Box>
            )}
          </Touchable>
        </Box>

        {/* Scrollable Content */}
        <ScrollView
          style={{ flex: 1, backgroundColor: colors.backgroundPrimary }}
          contentContainerStyle={{ padding: spacing['16'], paddingBottom: spacing['48'] }}
        >
          {loading ? (
            <Box style={{ gap: spacing['16'] }}>
              <Card tone='subtle' radiusKey='md' style={{ minHeight: spacing.xxl * 2 }} />
              <Card tone='subtle' radiusKey='md' style={{ minHeight: spacing.xxl * 2 }} />
            </Box>
          ) : error ? (
            <Box style={{ flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 200, gap: spacing.sm }}>
              <Icon name='info' size={32} color={colors.textSecondary} />
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
            <Box style={{ gap: spacing['16'] }}>
              {items.map((item) => (
                <Box key={item.id} style={{ flexDirection: 'row', gap: spacing['12'] }}>
                  {/* Thumbnail */}
                  <Box
                    style={{
                      width: 52,
                      height: 68,
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
                  <Box style={{ flex: 1, justifyContent: 'space-between' }}>
                    <Box style={{ gap: spacing['2'] }}>
                      {item.brand ? (
                        <Text variant='meta' size={10} tone='muted' weight='600' style={{ textTransform: 'uppercase' }}>
                          {item.brand}
                        </Text>
                      ) : null}
                      <Text variant='bodySm' weight='400' numberOfLines={2}>
                        {item.name}
                      </Text>
                    </Box>

                    {/* Quantity & Price Row */}
                    <Box style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: spacing.xs }}>
                      
                      {/* Pill Quantity Selector */}
                      <Box style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['8'] }}>
                        <Box
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            borderWidth: borderWidth.thin,
                            borderColor: colors.border,
                            borderRadius: radius.full,
                            backgroundColor: colors.surface,
                            height: 28,
                          }}
                        >
                          <Touchable
                            onPress={() => runMutation(item, 'updating', onDecrease)}
                            disabled={pendingById[item.id]}
                            style={{ width: 28, height: '100%', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <Text variant='bodySm' tone='muted' weight='500'>-</Text>
                          </Touchable>
                          <Box style={{ minWidth: 20, alignItems: 'center', justifyContent: 'center' }}>
                            <Text variant='meta' weight='500'>{item.quantity}</Text>
                          </Box>
                          <Touchable
                            onPress={() => runMutation(item, 'updating', onIncrease)}
                            disabled={pendingById[item.id]}
                            style={{ width: 28, height: '100%', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <Text variant='bodySm' tone='muted' weight='500'>+</Text>
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
                                width: spacing['32'],
                                height: spacing['32'],
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Icon
                                name='delete'
                                size={16}
                                color={hovered ? colors.error : colors.textSecondary}
                              />
                            </Box>
                          )}
                        </Touchable>
                      </Box>

                      <Box style={{ alignItems: 'flex-end' }}>
                        {pendingById[item.id] ? (
                          <Text variant='meta' size={10} tone='muted' style={{ marginBottom: 2 }}>
                            {actionById[item.id] === 'removing' ? 'Removing...' : 'Updating...'}
                          </Text>
                        ) : null}
                        <Text variant='bodySm' weight='600'>
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
              padding: spacing['16'],
              backgroundColor: colors.surface,
              borderTopWidth: borderWidth.thin,
              borderTopColor: colors.border,
              ...(Platform.OS === 'web'
                ? {
                    boxShadow: elevation.drawerFooter,
                  }
                : {}),
            }}
          >
            <Box style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing['12'] }}>
              <Text variant='bodySm' tone='muted'>Estimated Total</Text>
              <Text variant='title' weight='700'>{formatCurrency(subtotal, currency)}</Text>
            </Box>
            <Box style={{ flexDirection: 'row', gap: spacing['8'] }}>
              <Box style={{ flex: 1 }}>
                <Button
                  variant='ghost'
                  onPress={() => {
                    onViewCart()
                    onClose()
                  }}
                  style={{ width: '100%', minHeight: 44 }}
                >
                  View Full Cart
                </Button>
              </Box>
              <Box style={{ flex: 1.5 }}>
                <Button
                  variant='solid'
                  onPress={() => {
                    onCheckout()
                    onClose()
                  }}
                  style={{ width: '100%', minHeight: 44, paddingHorizontal: 0 }}
                >
                  Proceed to Checkout
                </Button>
              </Box>
            </Box>
          </Box>
        )}
      </View>
    </Box>
  )
}

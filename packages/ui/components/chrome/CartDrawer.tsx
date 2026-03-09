import { useEffect, useMemo, useRef, useState } from 'react'
import { Platform, View } from 'react-native'
import { borderWidth, colors, motionDuration, motionEasing, radius, spacing, zIndex } from '@real/tokens'
import { Box, Divider, Text, Touchable } from '../../primitives'
import { Button } from '../Button'
import { Card } from '../Card'

export type CartDrawerItem = {
  id: string
  name: string
  quantity: number
  price: number
  currency: string
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
          opacity: 0.25,
        }}
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
          width: spacing.xxl * 8,
          maxWidth: '92%' as any,
          backgroundColor: colors.surface,
          borderLeftWidth: borderWidth.thin,
          borderColor: colors.border,
          padding: spacing['16'],
          gap: spacing['16'],
          transitionProperty: 'transform, opacity',
          transitionDuration: `${motionDuration.pageReveal}ms`,
          transitionTimingFunction: motionEasing.standard,
        } as any}
      >
        <Box style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text variant='h2'>Cart</Text>
          <Touchable
            nativeID='cart-drawer-close'
            accessibilityRole='button'
            onPress={onClose}
            style={{
              minHeight: spacing['48'],
              paddingHorizontal: spacing['16'],
              justifyContent: 'center',
            }}
          >
            <Text variant='label'>Close</Text>
          </Touchable>
        </Box>

        {loading ? (
          <Box style={{ gap: spacing['16'] }}>
            <Card tone='subtle' style={{ minHeight: spacing.xxl }} />
            <Card tone='subtle' style={{ minHeight: spacing.xxl }} />
            <Card tone='subtle' style={{ minHeight: spacing.xxl }} />
          </Box>
        ) : error ? (
          <Box style={{ gap: spacing['16'] }}>
            <Text tone='danger'>Unable to load cart.</Text>
            <Text tone='muted' variant='bodySm'>{error}</Text>
          </Box>
        ) : items.length === 0 ? (
          <Box style={{ gap: spacing['16'] }}>
            <Text tone='muted'>Your cart is empty.</Text>
            <Box style={{ width: spacing.xxl * 3 }}>
              <Button
                variant='outline'
                onPress={() => {
                  onViewCart()
                  onClose()
                }}
              >
                Continue shopping
              </Button>
            </Box>
          </Box>
        ) : (
          <Box style={{ flex: 1, gap: spacing['16'], overflow: 'auto', overscrollBehavior: 'contain' } as any}>
            {items.map((item) => (
              <Box key={item.id} style={{ gap: spacing['8'], paddingBottom: spacing['16'] }}>
                <Text variant='bodySm' numberOfLines={2}>{item.name}</Text>
                <Box style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text tone='muted' variant='caption'>
                    {formatCurrency(item.price, item.currency)}
                  </Text>
                  <Text variant='label'>
                    {formatCurrency(item.price * item.quantity, item.currency)}
                  </Text>
                </Box>
                <Box style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['8'] }}>
                    <Button
                      size='sm'
                      variant='outline'
                      disabled={pendingById[item.id]}
                      onPress={() => runMutation(item, 'updating', onDecrease)}
                    >
                      -
                    </Button>
                    <Text variant='label'>{item.quantity}</Text>
                    <Button
                      size='sm'
                      variant='outline'
                      disabled={pendingById[item.id]}
                      onPress={() => runMutation(item, 'updating', onIncrease)}
                    >
                      +
                    </Button>
                  </Box>
                  <Button
                    size='sm'
                    variant='ghost'
                    disabled={pendingById[item.id]}
                    onPress={() => runMutation(item, 'removing', onRemove)}
                  >
                    Remove
                  </Button>
                </Box>
                {pendingById[item.id] ? (
                  <Text variant='caption' tone='muted'>
                    {actionById[item.id] === 'removing' ? 'Removing...' : 'Updating...'}
                  </Text>
                ) : null}
                <Divider />
              </Box>
            ))}
          </Box>
        )}

        <Divider />
        <Box style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text variant='title'>Subtotal ({totalQuantity})</Text>
          <Text variant='h2'>{formatCurrency(subtotal, currency)}</Text>
        </Box>
        <Box style={{ flexDirection: 'row', gap: spacing['16'] }}>
          <Box style={{ flex: 1 }}>
            <Button
              variant='outline'
              onPress={() => {
                onViewCart()
                onClose()
              }}
            >
              View cart
            </Button>
          </Box>
          <Box style={{ flex: 1 }}>
            <Button
              onPress={() => {
                onCheckout()
                onClose()
              }}
            >
              Checkout
            </Button>
          </Box>
        </Box>
      </View>
    </Box>
  )
}

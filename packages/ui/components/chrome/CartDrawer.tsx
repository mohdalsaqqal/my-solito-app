"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { I18nManager, Image, Platform } from 'react-native'
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
  locale?: string
}

const FALLBACK_IMAGE = '/brand-logo-placeholder.svg'

const currencyFormatterCache = new Map<string, Intl.NumberFormat>()

function getCurrencyFormatter(currencyCode: string, locale: string): Intl.NumberFormat {
  const key = `${locale}:${currencyCode}`
  let fmt = currencyFormatterCache.get(key)
  if (!fmt) {
    const localeTag = locale === 'ar' ? 'ar-SA' : 'en-US'
    fmt = new Intl.NumberFormat(localeTag, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    currencyFormatterCache.set(key, fmt)
  }
  return fmt
}

function getCopy(locale: string) {
  return locale === 'ar'
    ? {
        cartLabel: 'السلة',
        itemSingular: 'منتج',
        itemPlural: 'منتجات',
        addMore: 'أضف المزيد',
        freeDelivery: 'أضف {{amount}} للشحن المجاني',
        freeDeliveryUnlocked: 'لقد حصلت على شحن مجاني',
        emptyTitle: 'سلتك فارغة.',
        emptyCta: 'ابدأ التسوق',
        checkout: 'الدفع',
        estimatedTotal: 'الإجمالي التقديري',
        viewFullCart: 'عرض السلة كاملة',
        loadError: 'تعذر تحميل السلة.',
        closeLabel: 'إغلاق السلة',
        decreaseLabel: 'تقليل الكمية',
        increaseLabel: 'زيادة الكمية',
        deleteLabel: 'حذف من السلة',
        removing: 'جاري الحذف...',
        updating: 'جاري التحديث...',
        addMoreLabel: 'أضف المزيد للحصول على شحن مجاني',
        viewCartLabel: 'عرض السلة كاملة',
      }
    : {
        cartLabel: 'Bag',
        itemSingular: 'item',
        itemPlural: 'items',
        addMore: 'Add more',
        freeDelivery: 'Add {{amount}} for free delivery',
        freeDeliveryUnlocked: 'You unlocked free delivery',
        emptyTitle: 'Your cart is empty.',
        emptyCta: 'Start Shopping',
        checkout: 'Checkout',
        estimatedTotal: 'Estimated Total',
        viewFullCart: 'View full cart',
        loadError: 'Unable to load cart.',
        closeLabel: 'Close cart drawer',
        decreaseLabel: 'Decrease quantity',
        increaseLabel: 'Increase quantity',
        deleteLabel: 'Delete item from cart',
        removing: 'Removing...',
        updating: 'Updating...',
        addMoreLabel: 'Add more items for free delivery',
        viewCartLabel: 'View full cart',
      }
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
  locale = 'en',
}: CartDrawerProps) {
  const c = useThemeColors()
  const copy = getCopy(locale)
  const formatCurrency = useCallback(
    (value: number, currencyCode: string) => getCurrencyFormatter(currencyCode, locale).format(value),
    [locale],
  )

  const [pendingById, setPendingById] = useState<Record<string, boolean>>({})
  const [actionById, setActionById] = useState<Record<string, 'updating' | 'removing' | undefined>>({})
  const [visible, setVisible] = useState(false)
  const previousActiveRef = useRef<HTMLElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Animate in
  useEffect(() => {
    if (!open) return
    const raf = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(raf)
  }, [open])

  const handleClose = useCallback(() => {
    setVisible(false)
    setTimeout(() => onClose(), prefersReducedMotion ? 0 : 250)
  }, [onClose, prefersReducedMotion])

  // Focus trap
  useEffect(() => {
    if (!open || Platform.OS !== 'web') return
    const doc = (globalThis as { document?: Document }).document
    if (!doc) return
    previousActiveRef.current = doc.activeElement instanceof HTMLElement ? doc.activeElement : null
    const closeEl = doc.getElementById('cart-drawer-close')
    if (closeEl instanceof HTMLElement) closeEl.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { handleClose(); return }
      if (event.key !== 'Tab') return
      const panel = panelRef.current
      if (!panel) return
      const focusables = Array.from(
        panel.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.hasAttribute('disabled') && el.tabIndex !== -1)
      if (focusables.length === 0) { event.preventDefault(); return }
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (!first || !last) { event.preventDefault(); return }
      const active = doc.activeElement
      if (event.shiftKey) {
        if (active === first || !panel.contains(active)) { event.preventDefault(); last.focus() }
        return
      }
      if (active === last || !panel.contains(active)) { event.preventDefault(); first.focus() }
    }
    doc.addEventListener('keydown', onKeyDown)
    return () => {
      doc.removeEventListener('keydown', onKeyDown)
      if (previousActiveRef.current) previousActiveRef.current.focus()
    }
  }, [open, handleClose])

  // Body scroll lock
  useEffect(() => {
    if (!open || Platform.OS !== 'web') return
    const doc = (globalThis as { document?: Document }).document
    const body = doc?.body
    const root = doc?.documentElement
    if (!body || !root) return
    const prevBody = body.style.overflow
    const prevRoot = root.style.overflow
    body.style.overflow = 'hidden'
    root.style.overflow = 'hidden'
    return () => { body.style.overflow = prevBody; root.style.overflow = prevRoot }
  }, [open])

  const totalQuantity = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items])

  const runMutation = async (
    item: CartDrawerItem,
    action: 'updating' | 'removing',
    mutate?: (target: CartDrawerItem) => void | Promise<void>
  ) => {
    if (!mutate || pendingById[item.id]) return
    setPendingById((current) => ({ ...current, [item.id]: true }))
    setActionById((current) => ({ ...current, [item.id]: action }))
    try { await mutate(item) }
    finally {
      setPendingById((current) => ({ ...current, [item.id]: false }))
      setActionById((current) => ({ ...current, [item.id]: undefined }))
    }
  }

  if (!open || Platform.OS !== 'web') return null

  const isRtl =
    Platform.OS === 'web'
      ? (((globalThis as { document?: { documentElement?: { dir?: string } } }).document?.documentElement?.dir ??
          (I18nManager.isRTL ? 'rtl' : 'ltr')) === 'rtl')
      : I18nManager.isRTL

  const currency = items[0]?.currency ?? 'USD'
  const freeDeliveryTarget = freeDeliveryThreshold
  const amountToFreeDelivery = Math.max(0, freeDeliveryTarget - subtotal)
  const freeDeliveryProgress = Math.max(0, Math.min(1, subtotal / freeDeliveryTarget))
  const animateIn = !prefersReducedMotion
  const panelTransform = visible
    ? 'translateX(0)'
    : isRtl ? 'translateX(-100%)' : 'translateX(100%)'
  const itemLabel = totalQuantity === 1 ? copy.itemSingular : copy.itemPlural
  const freeDeliveryText = amountToFreeDelivery > 0
    ? copy.freeDelivery.replace('{{amount}}', formatCurrency(amountToFreeDelivery, currency))
    : copy.freeDeliveryUnlocked
  const progressOrigin = isRtl ? 'right' : 'left'

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={copy.cartLabel}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: zIndex.searchTop + 4,
      }}
    >
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={handleClose}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: c.inkBlack,
          opacity: visible ? 0.38 : 0,
          cursor: 'pointer',
          transition: animateIn ? 'opacity 250ms ease' : 'none',
        }}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        style={{
          position: 'absolute',
          top: 0,
          [isRtl ? 'left' : 'right']: 0,
          bottom: 0,
          width: 460,
          maxWidth: '100%',
          backgroundColor: c.surface,
          borderLeftWidth: borderWidth.thin,
          borderLeftColor: c.border,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: visible ? elevation.drawerPanel : 'none',
          transform: panelTransform,
          transition: animateIn ? 'transform 250ms cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
        }}
      >
        {/* Header */}
        <div style={{
          padding: `${spacing.space4} ${spacing.space4} ${spacing.space3}`,
          borderBottomWidth: borderWidth.thin,
          borderBottomColor: c.border,
          backgroundColor: c.surface,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div id="cart-drawer-close" style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconButton icon="close" label={copy.closeLabel} onPress={handleClose} tone="ghost" />
            </div>
            <Text variant="title" size={16} weight="700">
              {copy.cartLabel}
              <Text variant="caption" tone="muted">
                {' '}({totalQuantity} {itemLabel})
              </Text>
            </Text>
            <div style={{ width: spacing['32'], height: spacing['32'] }} />
          </div>
        </div>

        {/* Free Delivery Progress */}
        {items.length > 0 && (
          <div style={{
            padding: `${spacing.space2} ${spacing.space4}`,
            borderBottomWidth: borderWidth.thin,
            borderBottomColor: c.border,
            backgroundColor: c.surface,
          }}>
            <div style={{
              padding: `${spacing.space1} ${spacing.space1}`,
              backgroundColor: c.surface,
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: spacing.space2,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing.space2, flex: 1, minWidth: 0 }}>
                  <Icon name="shipping" size={14} color={c.textSecondary} />
                  <Text variant="bodySm" tone="muted" weight="500" numberOfLines={1} style={{ flex: 1 }}>
                    {freeDeliveryText}
                  </Text>
                </div>
                {amountToFreeDelivery > 0 ? (
                  <ReusableButton
                    onPress={() => { onViewCart(); handleClose() }}
                    accessibilityLabel={copy.addMoreLabel}
                    variant="ghost"
                    size="sm"
                    style={{
                      minHeight: spacing['24'],
                      borderRadius: radius.full,
                      paddingHorizontal: spacing.space2,
                      backgroundColor: c.surfaceMuted,
                      borderWidth: borderWidth.thin,
                      borderColor: c.border,
                    }}
                  >
                    <Text variant="caption" weight="700" tone="primary">
                      {copy.addMore}
                    </Text>
                  </ReusableButton>
                ) : null}
              </div>
              <div style={{
                height: spacing['1'],
                borderRadius: radius.full,
                backgroundColor: c.surfaceMuted,
                overflow: 'hidden',
                marginTop: spacing.space1,
                transformOrigin: progressOrigin,
              }}>
                <div style={{
                  height: '100%',
                  width: '100%',
                  backgroundColor: c.brandPrimary,
                  transform: `scaleX(${freeDeliveryProgress})`,
                  transformOrigin: progressOrigin,
                  borderRadius: radius.full,
                  transition: animateIn ? `transform ${motionDuration.interactive}ms ease` : 'none',
                }} />
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: `${spacing.space3} ${spacing.space3} ${spacing.space4}`,
          backgroundColor: c.surface,
        }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.space4 }}>
              <Card tone="subtle" radiusKey="md" style={{ minHeight: spacing.xxl * 2 }} />
              <Card tone="subtle" radiusKey="md" style={{ minHeight: spacing.xxl * 2 }} />
            </div>
          ) : error ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 200, gap: spacing.sm }}>
              <Icon name="unknown" size={32} color={c.textSecondary} />
              <Text tone="danger" weight="600">{copy.loadError}</Text>
              <Text tone="muted" variant="bodySm">{error}</Text>
            </div>
          ) : items.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: spacing.lg }}>
              <Icon name="cart" size={48} color={c.border} />
              <Text tone="muted" variant="title" weight="600">{copy.emptyTitle}</Text>
              <Button
                variant="solid"
                onPress={() => { onViewCart(); handleClose() }}
              >
                {copy.emptyCta}
              </Button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.space3 }}>
              {items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    gap: spacing.space2,
                    paddingTop: spacing.space2,
                    paddingBottom: spacing.space2,
                    borderRadius: radius.sm,
                    backgroundColor: c.surface,
                    borderBottomWidth: borderWidth.thin,
                    borderBottomColor: c.stroke,
                  }}
                >
                  {/* Thumbnail */}
                  <div style={{
                    width: 52,
                    height: 64,
                    borderRadius: radius.sm,
                    backgroundColor: c.backgroundSecondary,
                    borderWidth: borderWidth.thin,
                    borderColor: c.border,
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}>
                    <Image
                      source={{ uri: item.imageUrl || FALLBACK_IMAGE }}
                      alt={item.name}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode="cover"
                      {...(Platform.OS === 'web' ? { loading: 'lazy' } : {})}
                    />
                  </div>

                  {/* Details */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: spacing.space1, minWidth: 0 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.space1 }}>
                      {item.brand ? (
                        <Text variant="caption" size={10} tone="muted" weight="600" style={{ textTransform: 'uppercase', letterSpacing: 0.6 }}>
                          {item.brand}
                        </Text>
                      ) : null}
                      <Text variant="bodySm" weight="400" numberOfLines={2}>
                        {item.name}
                      </Text>
                    </div>

                    {/* Quantity & Price Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: spacing.space2 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: spacing.space1 }}>
                        {/* Pill Quantity Selector */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          borderWidth: borderWidth.thin,
                          borderColor: c.border,
                          borderRadius: radius.full,
                          backgroundColor: c.surfaceMuted,
                        }}>
                          <ReusableButton
                            onPress={() => runMutation(item, 'updating', onDecrease)}
                            disabled={pendingById[item.id]}
                            accessibilityLabel={copy.decreaseLabel}
                            variant="ghost"
                            size="icon"
                            style={{ width: 44, height: 44, minWidth: 44, minHeight: 44, paddingHorizontal: 0, paddingVertical: 0, alignItems: 'center', justifyContent: 'center' }}
                          >
                            <Text variant="caption" tone="muted" weight="700">−</Text>
                          </ReusableButton>
                          <div style={{ minWidth: 20, alignItems: 'center', justifyContent: 'center' }}>
                            <Text variant="caption" weight="700">{item.quantity}</Text>
                          </div>
                          <ReusableButton
                            onPress={() => runMutation(item, 'updating', onIncrease)}
                            disabled={pendingById[item.id]}
                            accessibilityLabel={copy.increaseLabel}
                            variant="ghost"
                            size="icon"
                            style={{ width: 44, height: 44, minWidth: 44, minHeight: 44, paddingHorizontal: 0, paddingVertical: 0, alignItems: 'center', justifyContent: 'center' }}
                          >
                            <Text variant="caption" tone="muted" weight="700">+</Text>
                          </ReusableButton>
                        </div>

                        <ReusableButton
                          onPress={() => runMutation(item, 'removing', onRemove)}
                          disabled={pendingById[item.id]}
                          accessibilityLabel={copy.deleteLabel}
                          variant="ghost"
                          size="icon"
                          style={{
                            width: 44, height: 44, minWidth: 44, minHeight: 44,
                            paddingHorizontal: 0, paddingVertical: 0,
                            borderRadius: radius.full, backgroundColor: c.surface,
                          }}
                        >
                          <Icon name="delete" size={14} color={c.textSecondary} />
                        </ReusableButton>
                      </div>

                      <div style={{ alignItems: 'flex-end' }}>
                        {pendingById[item.id] ? (
                          <Text variant="caption" size={10} tone="muted" style={{ marginBottom: 2 }}>
                            {actionById[item.id] === 'removing' ? copy.removing : copy.updating}
                          </Text>
                        ) : null}
                        <Text variant="bodySm" weight="700">
                          {formatCurrency(item.price * item.quantity, item.currency)}
                        </Text>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sticky Footer */}
        {items.length > 0 && !loading && !error ? (
          <div style={{
            padding: `${spacing.space2} ${spacing.space3} ${spacing.space3}`,
            backgroundColor: c.surface,
            borderTopWidth: borderWidth.thin,
            borderTopColor: c.border,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.space2 }}>
              <Text variant="bodySm" tone="muted">{copy.estimatedTotal}</Text>
              <Text variant="title" size={16} weight="700">{formatCurrency(subtotal, currency)}</Text>
            </div>
            <Button
              variant="solid"
              size="sm"
              fullWidth
              onPress={() => { onCheckout(); handleClose() }}
            >
              {copy.checkout}
            </Button>
            <div style={{ alignItems: 'center', marginTop: spacing.space2 }}>
              <ReusableButton
                onPress={() => { onViewCart(); handleClose() }}
                accessibilityLabel={copy.viewCartLabel}
                variant="link"
                size="sm"
                style={{ paddingHorizontal: 0, paddingVertical: 0 }}
              >
                <Text variant="bodySm" tone="muted" style={{ textDecorationLine: 'underline' }}>
                  {copy.viewFullCart}
                </Text>
              </ReusableButton>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
})

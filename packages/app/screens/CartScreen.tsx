import React, { useMemo, useState } from 'react'
import { Platform } from 'react-native'
import { useTranslation } from '@real/app/lib/i18n/use-translation'
import { borderWidth, componentTokens, spacing } from '@real/tokens'
import { PageScaffold, Section } from '@real/ui'
import { Box, Divider, Text } from '@real/ui/primitives'
import { Button, Card, PaymentBadges, QuantityInput } from '@real/ui/components'
import { passThroughPricingService } from '@real/app/lib/pricing'
import { useBreakpoint, useThemeColors } from '@real/ui/responsive'
import { useRouter } from 'solito/navigation'

type CartScreenItem = {
  productId: string
  name: string
  quantity: number
  price: number
  currency: string
}

type CartScreenProps = {
  items: CartScreenItem[]
  loading: boolean
  error: string | null
  onIncrease: (productId: string, quantity: number) => void | Promise<void>
  onDecrease: (productId: string, quantity: number) => void | Promise<void>
  onRemove: (productId: string) => void | Promise<void>
  onCheckout: () => void
  onRetry: () => void
}

function SummaryRow({
  label,
  value,
  emphasis = false,
}: {
  label: string
  value: string
  emphasis?: boolean
}) {
  return (
    <Box style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Text variant={emphasis ? 'title' : 'bodySm'} tone={emphasis ? 'default' : 'muted'}>
        {label}
      </Text>
      <Text variant={emphasis ? 'title' : 'label'} tone={emphasis ? 'default' : 'danger'}>
        {value}
      </Text>
    </Box>
  )
}

export const CartScreen = React.memo(function CartScreen({
  items,
  loading,
  error,
  onIncrease,
  onDecrease,
  onRemove,
  onCheckout,
  onRetry,
}: CartScreenProps) {
  const profile = useBreakpoint()
  const c = useThemeColors()
  const { t } = useTranslation('cart')
  const router = useRouter()
  const isCompact = profile.breakpoint === 'mobile'
  const isDesktop = profile.breakpoint === 'desktop'
  const cartTokens = componentTokens.storefrontCommerce.cart
  const cartTitle = t('title')
  const loadErrorTitle = t('error.loadFailed')
  const retryLabel = t('actions.retry')
  const emptyTitle = t('empty.title')
  const emptyMessage = t('empty.subtitle')
  const removeLabel = t('item.remove')
  const removingLabel = t('item.removing')
  const updatingLabel = t('item.updating')
  const summaryTitle = t('summary.title')
  const subtotalLabel = t('summary.subtotal')
  const shippingLabel = t('summary.shipping')
  const totalLabel = t('summary.total')
  const summaryNotice = t('summary.notice')
  const checkoutLabel = t('actions.checkout')

  const [pendingById, setPendingById] = useState<Record<string, boolean>>({})
  const [actionById, setActionById] = useState<Record<string, 'updating' | 'removing' | undefined>>({})
  const [actionErrorById, setActionErrorById] = useState<Record<string, string | null>>({})

  const cartTotals = useMemo(
    () => passThroughPricingService.getCartTotals(items),
    [items],
  )
  const currency = cartTotals.currency
  const formatter = useMemo(
    () =>
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    [currency],
  )
  const formatCurrency = (value: number) => formatter.format(value)

  const runMutation = async (
    productId: string,
    action: 'updating' | 'removing',
    mutate: () => void | Promise<void>
  ) => {
    if (pendingById[productId]) {
      return
    }
    setPendingById((current) => ({ ...current, [productId]: true }))
    setActionById((current) => ({ ...current, [productId]: action }))
    setActionErrorById((current) => ({ ...current, [productId]: null }))
    try {
      await mutate()
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : t('item.updateError')
      setActionErrorById((current) => ({ ...current, [productId]: message }))
    } finally {
      setPendingById((current) => ({ ...current, [productId]: false }))
      setActionById((current) => ({ ...current, [productId]: undefined }))
    }
  }

  if (loading) {
    return (
      <PageScaffold variant='cart' density='standard' scroll='auto'>
        <PageScaffold.Body>
          <Section>
            <Box gap='md'>
              <Card tone='subtle' style={{ minHeight: spacing.xxl * 2 }} />
              <Card tone='subtle' style={{ minHeight: spacing.xxl * 2 }} />
              <Card tone='subtle' style={{ minHeight: spacing.xxl * 2 }} />
            </Box>
          </Section>
        </PageScaffold.Body>
      </PageScaffold>
    )
  }

  if (error) {
    return (
      <PageScaffold variant='cart' density='standard' scroll='auto'>
        <PageScaffold.Body>
          <Section>
            <Box gap='md'>
              <Text variant='h1'>{loadErrorTitle}</Text>
              <Text tone='muted'>{error}</Text>
              <Box style={isCompact ? undefined : { width: spacing.xxl * 3 }}>
                <Button variant='outline' onPress={onRetry}>{retryLabel}</Button>
              </Box>
            </Box>
          </Section>
        </PageScaffold.Body>
      </PageScaffold>
    )
  }

  if (items.length === 0) {
    return (
      <PageScaffold variant='cart' density='standard' scroll='auto'>
        <PageScaffold.Body>
          <Section>
            <Box gap='md'>
              <Text variant='h1'>{emptyTitle}</Text>
              <Text tone='muted'>{emptyMessage}</Text>
              <Box style={{ width: spacing.xxl * 3 }}>
                <Button onPress={() => router.push('/shop')}>{t('actions.startShopping')}</Button>
              </Box>
            </Box>
          </Section>
        </PageScaffold.Body>
      </PageScaffold>
    )
  }

  return (
    <PageScaffold variant='cart' density='standard' scroll='auto'>
      <PageScaffold.Body>
        <Section>
          <Box style={{ gap: cartTokens.summaryGap }}>
            <Text variant='h1'>{cartTitle}</Text>
            <Box
              style={{
                flexDirection: isDesktop ? 'row' : 'column',
                alignItems: 'flex-start',
                gap: cartTokens.summaryGap,
              }}
            >
              <Box style={{ flex: 1, width: '100%' as const, gap: cartTokens.listGap }}>
                {items.map((item) => (
                  <Card
                    key={item.productId}
                    variant='raised'
                    style={{
                      gap: cartTokens.itemGap,
                      borderWidth: borderWidth.thin,
                      borderColor: c.stroke,
                      padding: cartTokens.itemPadding,
                    }}
                  >
                    <Box
                      style={{
                        flexDirection: isCompact ? 'column' : 'row',
                        alignItems: isCompact ? 'flex-start' : 'center',
                        justifyContent: 'space-between',
                        gap: spacing['8'],
                      }}
                    >
                      <Box style={{ flex: 1, gap: spacing.xxs }}>
                        <Text variant='title'>{item.name}</Text>
                        <Text tone='muted' variant='bodySm'>
                          {`${formatCurrency(passThroughPricingService.getProductPrice(item).unitPrice)} each`}
                        </Text>
                      </Box>
                      <Text variant='price' tone='danger'>
                        {formatCurrency(
                          passThroughPricingService.getProductPrice(item, { quantity: item.quantity }).subtotal ?? 0
                        )}
                      </Text>
                    </Box>

                    <Box
                      style={{
                        flexDirection: isCompact ? 'column' : 'row',
                        alignItems: isCompact ? 'flex-start' : 'center',
                        justifyContent: 'space-between',
                        gap: spacing['8'],
                      }}
                    >
                      <QuantityInput
                        value={item.quantity}
                        min={1}
                        disabled={pendingById[item.productId]}
                        onChange={(nextQuantity) => {
                          if (nextQuantity > item.quantity) {
                            void runMutation(item.productId, 'updating', () => onIncrease(item.productId, item.quantity))
                            return
                          }
                          if (nextQuantity < item.quantity) {
                            void runMutation(item.productId, 'updating', () => onDecrease(item.productId, item.quantity))
                          }
                        }}
                      />
                      <Button
                        variant='ghost'
                        size='sm'
                        disabled={pendingById[item.productId]}
                        onPress={() => runMutation(item.productId, 'removing', () => onRemove(item.productId))}
                      >
                        {removeLabel}
                      </Button>
                    </Box>

                    {pendingById[item.productId] ? (
                      <Text variant='caption' tone='muted'>
                        {actionById[item.productId] === 'removing' ? removingLabel : updatingLabel}
                      </Text>
                    ) : null}
                    {actionErrorById[item.productId] ? (
                      <Text variant='caption' tone='danger'>{actionErrorById[item.productId]}</Text>
                    ) : null}
                  </Card>
                ))}
              </Box>

              <Box
                style={
                  isDesktop
                    ? ({
                        width: spacing.xxl * 7,
                        position: Platform.OS === 'web' ? ('sticky' as const) : undefined,
                        top: Platform.OS === 'web' ? cartTokens.stickyPanelTop : undefined,
                      } as any)
                    : { width: '100%' as const }
                }
              >
                <Card
                  variant='raised'
                  style={{
                    gap: cartTokens.summaryGap,
                    borderWidth: borderWidth.thin,
                    borderColor: c.stroke,
                    padding: cartTokens.summaryPanelPadding,
                  }}
                >
                  <Text variant='title'>{summaryTitle}</Text>
                  <Divider />
                  <Box style={{ gap: spacing['8'] }}>
                    <SummaryRow label={subtotalLabel} value={formatCurrency(cartTotals.subtotal)} />
                    <SummaryRow label={shippingLabel} value={formatCurrency(0)} />
                    <SummaryRow label={totalLabel} value={formatCurrency(cartTotals.subtotal)} emphasis />
                  </Box>
                  <PaymentBadges />
                  <Text variant='caption' tone='muted'>
                    {summaryNotice}
                  </Text>
                  <Button onPress={onCheckout}>{checkoutLabel}</Button>
                </Card>
              </Box>
            </Box>
          </Box>
        </Section>
      </PageScaffold.Body>
    </PageScaffold>
  )
})

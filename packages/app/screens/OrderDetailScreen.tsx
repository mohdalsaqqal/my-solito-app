import { Image, useWindowDimensions } from 'react-native'
import { borderWidth, breakpoints, colors, radius, spacing } from '@real/tokens'
import { PageScaffold, Section } from '@real/ui'
import { Card } from '@real/ui/components'
import { Box, Text, Touchable } from '@real/ui/primitives'
import { OrderStatus, OrderSummary } from '@real/app/lib/types'
import { passThroughPricingService } from '@real/app/lib/pricing'

type OrderDetailScreenProps = {
  order?: OrderSummary | null
  loading?: boolean
  error?: string | null
  onBack?: () => void
  onReload?: () => void
}

export function OrderDetailScreen({
  order,
  loading = false,
  error = null,
  onBack,
  onReload,
}: OrderDetailScreenProps) {
  const { width } = useWindowDimensions()
  const isCompact = width > 0 && width < breakpoints.tabletMin

  const formatMoney = (value: number, currency: string) => `${currency} ${value.toFixed(2)}`
  const statusSteps: OrderStatus[] = ['placed', 'shipped', 'delivered']

  const statusIndex = (status: OrderStatus) => {
    if (status === 'cancelled') return -1
    return statusSteps.indexOf(status)
  }

  const splitName = (rawName: string) => {
    const parts = rawName.split('-')
    if (parts.length < 2) {
      return {
        brand: rawName.trim(),
        name: rawName.trim(),
      }
    }
    return {
      brand: parts[0]?.trim() || rawName.trim(),
      name: parts.slice(1).join('-').trim() || rawName.trim(),
    }
  }

  const getFallbackPricing = (target: OrderSummary) => {
    const subtotalFromItems = passThroughPricingService.getCartTotals(target.items ?? []).subtotal
    if (target.total <= subtotalFromItems) {
      return {
        subtotal: Math.round(subtotalFromItems * 100) / 100,
        delivery: 0,
        discount: Math.round((subtotalFromItems - target.total) * 100) / 100,
      }
    }
    return {
      subtotal: Math.round(subtotalFromItems * 100) / 100,
      delivery: Math.round((target.total - subtotalFromItems) * 100) / 100,
      discount: 0,
    }
  }

  if (loading) {
    return (
      <PageScaffold variant='account' density='standard' scroll='auto'>
        <PageScaffold.Body>
          <Section>
            <Box gap='md'>
              <Card tone='subtle' style={{ minHeight: spacing.xxl * 3 }} />
            </Box>
          </Section>
        </PageScaffold.Body>
      </PageScaffold>
    )
  }

  return (
    <PageScaffold variant='account' density='standard' scroll='auto'>
      <PageScaffold.Body>
        <Section>
          <Box gap='lg'>
      <Box
        style={{
          flexDirection: isCompact ? 'column' : 'row',
          alignItems: isCompact ? 'flex-start' : 'center',
          justifyContent: 'space-between',
          gap: spacing['8'],
        }}
      >
        <Text variant='h2'>Order Details</Text>
        <Touchable onPress={onBack}>
          <Text variant='label' tone='primary'>Back to orders</Text>
        </Touchable>
      </Box>

      {error ? (
        <Card tone='subtle' style={{ gap: spacing.sm }}>
          <Text tone='danger'>Unable to load order.</Text>
          <Text tone='muted' variant='bodySm'>{error}</Text>
          <Touchable onPress={onReload}>
            <Text variant='label' tone='primary'>Retry</Text>
          </Touchable>
        </Card>
      ) : !order ? (
        <Card tone='subtle'>
          <Text tone='muted'>Order not found.</Text>
        </Card>
      ) : (
        <Card variant='raised' style={{ gap: spacing['12'] }}>
          <Text variant='title'>Order {order.id}</Text>
          <Text variant='bodySm' tone='muted'>Status: {order.status}</Text>
          <Card tone='subtle' style={{ gap: spacing['8'] }}>
            <Text variant='caption' tone='muted'>Order journey</Text>
            {order.status === 'cancelled' ? (
              <Box style={{ flexDirection: 'row', gap: spacing['8'], alignItems: 'center', flexWrap: 'wrap' }}>
                {statusSteps.map((step) => (
                  <Box
                    key={step}
                    style={{
                      paddingVertical: spacing['4'],
                      paddingHorizontal: spacing['8'],
                      borderRadius: radius.xs,
                      borderWidth: borderWidth.thin,
                      borderColor: colors.divider,
                      backgroundColor: colors.surface,
                    }}
                  >
                    <Text variant='caption' tone='muted' style={{ textTransform: 'capitalize' }}>
                      {step}
                    </Text>
                  </Box>
                ))}
                <Box
                  style={{
                    paddingVertical: spacing['4'],
                    paddingHorizontal: spacing['8'],
                    borderRadius: radius.xs,
                    borderWidth: borderWidth.thin,
                    borderColor: colors.brandPrimary,
                    backgroundColor: colors.brandPrimarySubtle,
                  }}
                >
                  <Text variant='caption' tone='danger' style={{ textTransform: 'capitalize' }}>
                    cancelled
                  </Text>
                </Box>
              </Box>
            ) : (
              <Box style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing['8'] }}>
                {statusSteps.map((step) => {
                  const completed = statusIndex(order.status) >= statusIndex(step)
                  return (
                    <Box
                      key={step}
                      style={{
                        paddingVertical: spacing['4'],
                        paddingHorizontal: spacing['8'],
                        borderRadius: radius.xs,
                        borderWidth: borderWidth.thin,
                        borderColor: completed ? colors.brandPrimary : colors.divider,
                        backgroundColor: completed ? colors.brandPrimarySubtle : colors.surface,
                      }}
                    >
                      <Text
                        variant='caption'
                        tone={completed ? 'primary' : 'muted'}
                        style={{ textTransform: 'capitalize' }}
                      >
                        {step}
                      </Text>
                    </Box>
                  )
                })}
              </Box>
            )}
          </Card>
          <Text variant='bodySm' tone='muted'>Date: {new Date(order.createdAt).toLocaleDateString()}</Text>

          <Card tone='subtle' style={{ gap: spacing['8'] }}>
            <Text variant='title'>Delivery & payment</Text>
            <Text variant='bodySm' tone='muted'>
              {`Fulfillment: ${order.fulfillment?.mode === 'pickup' ? 'Branch pickup' : 'Delivery'}`}
            </Text>
            <Text variant='bodySm' tone='muted'>
              {`Payment: ${
                order.fulfillment?.paymentMethod === 'card_on_delivery'
                  ? 'Card on delivery (POS)'
                  : order.fulfillment?.paymentMethod === 'online_card'
                    ? 'Online card'
                    : order.fulfillment?.paymentMethod === 'pay_at_branch'
                      ? 'Pay at branch'
                      : 'Cash on delivery'
              }`}
            </Text>
            {order.fulfillment?.mode === 'delivery' ? (
              <Text variant='bodySm' tone='muted'>
                {`Delivery address: ${order.fulfillment?.addressLine || 'N/A'}`}
              </Text>
            ) : (
              <Text variant='bodySm' tone='muted'>
                {`Pickup branch: ${order.fulfillment?.branchName || 'N/A'}`}
              </Text>
            )}
          </Card>

          <Card tone='subtle' style={{ gap: spacing['8'] }}>
            <Text variant='title'>Pricing</Text>
            {(() => {
              const pricing = order.pricing ?? getFallbackPricing(order)
              return (
                <Box style={{ gap: spacing['4'] }}>
                  <Text variant='bodySm' tone='muted'>
                    {`Subtotal: ${formatMoney(pricing.subtotal, order.currency)}`}
                  </Text>
                  <Text variant='bodySm' tone='muted'>
                    {`Delivery: ${formatMoney(pricing.delivery, order.currency)}`}
                  </Text>
                  <Text variant='bodySm' tone='muted'>
                    {`Discount: -${formatMoney(pricing.discount, order.currency)}`}
                  </Text>
                  <Text variant='label'>
                    {`Total: ${formatMoney(order.total, order.currency)}`}
                  </Text>
                </Box>
              )
            })()}
          </Card>

          <Text variant='title'>Items</Text>
          {!order.items || order.items.length === 0 ? (
            <Text tone='muted' variant='caption'>No order items available yet.</Text>
          ) : (
            <Box style={{ gap: spacing['8'] }}>
              {order.items.map((item) => {
                const fallback = splitName(item.name)
                return (
                  <Card key={`${order.id}-${item.productId}`} tone='subtle'>
                    <Box
                      style={{
                        flexDirection: isCompact ? 'column' : 'row',
                        alignItems: isCompact ? 'flex-start' : 'center',
                        gap: spacing['12'],
                      }}
                    >
                      <Box
                        style={{
                          width: spacing['48'],
                          height: spacing['48'],
                          borderRadius: radius.sm,
                          backgroundColor: colors.surfaceMuted,
                          overflow: 'hidden',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderColor: colors.divider,
                          borderWidth: borderWidth.thin,
                        }}
                      >
                        {item.imageUrl ? (
                          <Image
                            source={{ uri: item.imageUrl }}
                            style={{ width: spacing['48'], height: spacing['48'] }}
                            resizeMode='cover'
                          />
                        ) : (
                          <Text tone='muted' variant='caption'>IMG</Text>
                        )}
                      </Box>
                    <Box style={{ flex: 1, gap: spacing['4'] }}>
                      <Text tone='muted' variant='caption'>{item.brand || fallback.brand}</Text>
                        <Text variant='label'>{item.name}</Text>
                        <Text tone='primary' variant='label'>
                          {formatMoney(passThroughPricingService.getProductPrice(item).unitPrice, item.currency)} x {item.quantity}
                        </Text>
                      </Box>
                    </Box>
                  </Card>
                )
              })}
            </Box>
          )}
        </Card>
      )}
          </Box>
        </Section>
      </PageScaffold.Body>
    </PageScaffold>
  )
}

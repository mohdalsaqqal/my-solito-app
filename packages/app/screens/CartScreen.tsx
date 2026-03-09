import { useState } from 'react'
import { useWindowDimensions } from 'react-native'
import { borderWidth, breakpoints, spacing } from '@real/tokens'
import { PageScaffold, Section } from '@real/ui'
import { Box, Divider, Text } from '@real/ui/primitives'
import { Button, Card } from '@real/ui/components'
import { passThroughPricingService } from '@real/app/lib/pricing'

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

export function CartScreen({
  items,
  loading,
  error,
  onIncrease,
  onDecrease,
  onRemove,
  onCheckout,
  onRetry,
}: CartScreenProps) {
  const { width } = useWindowDimensions()
  const isCompact = width > 0 && width < breakpoints.tabletMin

  const [pendingById, setPendingById] = useState<Record<string, boolean>>({})
  const [actionById, setActionById] = useState<Record<string, 'updating' | 'removing' | undefined>>({})
  const [actionErrorById, setActionErrorById] = useState<Record<string, string | null>>({})

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
      const message = cause instanceof Error ? cause.message : 'Unable to update cart item.'
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
              <Text variant='h2'>Unable to load cart</Text>
              <Text tone='muted'>{error}</Text>
              <Box style={isCompact ? undefined : { width: spacing.xxl * 3 }}>
                <Button variant='outline' onPress={onRetry}>Retry</Button>
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
              <Text variant='h2'>Your cart is empty</Text>
              <Text tone='muted'>Add products to start checkout.</Text>
            </Box>
          </Section>
        </PageScaffold.Body>
      </PageScaffold>
    )
  }

  const cartTotals = passThroughPricingService.getCartTotals(items)
  const currency = cartTotals.currency

  return (
    <PageScaffold variant='cart' density='standard' scroll='auto'>
      <PageScaffold.Body>
        <Section>
          <Box gap='lg'>
      <Text variant='h2'>Cart</Text>
      <Box gap='md'>
        {items.map((item) => (
          <Card key={item.productId} variant='raised' style={{ gap: spacing.sm, borderWidth: borderWidth.thin }}>
            <Text variant='title'>{item.name}</Text>
            <Box
              style={{
                flexDirection: isCompact ? 'column' : 'row',
                alignItems: isCompact ? 'flex-start' : 'center',
                justifyContent: 'space-between',
                gap: spacing['8'],
              }}
            >
              <Text tone='muted' variant='bodySm'>
                {item.currency} {passThroughPricingService.getProductPrice(item).unitPrice.toFixed(2)} each
              </Text>
              <Text variant='price' tone='danger'>
                {item.currency} {(passThroughPricingService.getProductPrice(item, { quantity: item.quantity }).subtotal ?? 0).toFixed(2)}
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
              <Box style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                <Button
                  variant='outline'
                  size='sm'
                  disabled={pendingById[item.productId]}
                  onPress={() =>
                    runMutation(item.productId, 'updating', () => onDecrease(item.productId, item.quantity))
                  }
                >
                  -
                </Button>
                <Text variant='title'>{item.quantity}</Text>
                <Button
                  variant='outline'
                  size='sm'
                  disabled={pendingById[item.productId]}
                  onPress={() =>
                    runMutation(item.productId, 'updating', () => onIncrease(item.productId, item.quantity))
                  }
                >
                  +
                </Button>
              </Box>
              <Button
                variant='ghost'
                size='sm'
                disabled={pendingById[item.productId]}
                onPress={() =>
                  runMutation(item.productId, 'removing', () => onRemove(item.productId))
                }
              >
                Remove
              </Button>
            </Box>
            {pendingById[item.productId] ? (
              <Text variant='caption' tone='muted'>
                {actionById[item.productId] === 'removing' ? 'Removing...' : 'Updating...'}
              </Text>
            ) : null}
            {actionErrorById[item.productId] ? (
              <Text variant='caption' tone='danger'>{actionErrorById[item.productId]}</Text>
            ) : null}
          </Card>
        ))}
      </Box>
      <Divider />
      <Box style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text variant='title'>Subtotal</Text>
        <Text variant='h2' tone='danger'>{currency} {cartTotals.subtotal.toFixed(2)}</Text>
      </Box>
      <Box style={isCompact ? undefined : { width: spacing.xxl * 4 }}>
        <Button onPress={onCheckout}>Checkout</Button>
      </Box>
          </Box>
        </Section>
      </PageScaffold.Body>
    </PageScaffold>
  )
}

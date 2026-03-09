import { useWindowDimensions } from 'react-native'
import { breakpoints, spacing } from '@real/tokens'
import { PageScaffold, Section } from '@real/ui'
import { Button, Card } from '@real/ui/components'
import { Box, Text, Touchable } from '@real/ui/primitives'
import { OrderSummary } from '@real/app/lib/types'

type OrdersScreenProps = {
  orders?: OrderSummary[]
  loading?: boolean
  error?: string | null
  onReload?: () => void
  onSelectOrder?: (orderId: string) => void
}

export function OrdersScreen({
  orders = [],
  loading = false,
  error = null,
  onReload,
  onSelectOrder,
}: OrdersScreenProps) {
  const { width } = useWindowDimensions()
  const isCompact = width > 0 && width < breakpoints.tabletMin

  if (loading) {
    return (
      <PageScaffold variant='account' density='standard' scroll='auto'>
        <PageScaffold.Body>
          <Section>
            <Box gap='md'>
              <Card tone='subtle' style={{ minHeight: spacing.xxl * 2 }} />
              <Card tone='subtle' style={{ minHeight: spacing.xxl * 2 }} />
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
      <Box style={{ gap: spacing['8'] }}>
        <Text variant='h2'>Orders</Text>
        <Text tone='muted'>Track your recent purchases and fulfillment status.</Text>
      </Box>

      {error ? (
        <Card tone='subtle' style={{ gap: spacing.sm }}>
          <Text tone='danger'>Unable to load orders.</Text>
          <Text tone='muted' variant='bodySm'>{error}</Text>
          <Touchable onPress={onReload}>
            <Text variant='label' tone='primary'>Retry</Text>
          </Touchable>
        </Card>
      ) : orders.length === 0 ? (
        <Card tone='subtle'>
          <Text tone='muted'>No orders yet.</Text>
        </Card>
      ) : (
        <Box style={{ gap: spacing.md }}>
          {orders.map((order) => (
            <Card key={order.id} variant='flat' style={{ gap: spacing['8'] }}>
              <Text variant='label'>Order ID: {order.id}</Text>
              <Text variant='caption' tone='muted'>
                Date: {new Date(order.createdAt).toLocaleDateString()}
              </Text>
              <Text variant='bodySm' tone='muted'>Status: {order.status}</Text>
              <Text variant='bodySm' tone='muted'>
                Total: {order.currency} {order.total.toFixed(2)}
              </Text>
              <Box style={isCompact ? undefined : { width: spacing['128'] }}>
                <Button size='sm' variant='outline' onPress={() => onSelectOrder?.(order.id)}>
                  View order
                </Button>
              </Box>
            </Card>
          ))}
        </Box>
      )}
          </Box>
        </Section>
      </PageScaffold.Body>
    </PageScaffold>
  )
}

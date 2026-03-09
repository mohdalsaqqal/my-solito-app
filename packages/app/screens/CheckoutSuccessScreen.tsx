import { spacing } from '@real/tokens'
import { PageScaffold, Section } from '@real/ui'
import { Box, Text } from '@real/ui/primitives'
import { Button, Card } from '@real/ui/components'

type CheckoutSuccessScreenProps = {
  orderId: string
  orderTotal: string
  createdAt?: string
  onContinueShopping: () => void
  onViewAccount: () => void
}

export function CheckoutSuccessScreen({
  orderId,
  orderTotal,
  createdAt,
  onContinueShopping,
  onViewAccount,
}: CheckoutSuccessScreenProps) {
  return (
    <PageScaffold variant='checkout' density='standard' scroll='auto'>
      <PageScaffold.Body>
        <Section>
          <Card variant='raised' style={{ gap: spacing['16'] }}>
            <Text variant='h2'>Order placed</Text>
            <Text tone='muted'>Your order was submitted successfully.</Text>
            <Box style={{ gap: spacing['8'] }}>
              <Text variant='bodySm'>Order ID: {orderId}</Text>
              <Text variant='bodySm'>Total: {orderTotal}</Text>
              {createdAt ? <Text variant='caption' tone='muted'>Placed at: {createdAt}</Text> : null}
            </Box>
            <Box style={{ flexDirection: 'row', gap: spacing['16'], flexWrap: 'wrap' }}>
              <Box style={{ width: spacing.xxl * 4 }}>
                <Button variant='outline' onPress={onContinueShopping}>
                  Continue shopping
                </Button>
              </Box>
              <Box style={{ width: spacing.xxl * 4 }}>
                <Button onPress={onViewAccount}>
                  View account
                </Button>
              </Box>
            </Box>
          </Card>
        </Section>
      </PageScaffold.Body>
    </PageScaffold>
  )
}

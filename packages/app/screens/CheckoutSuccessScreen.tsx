import { spacing } from '@real/tokens'
import { PageScaffold, Section } from '@real/ui'
import { Box, Text } from '@real/ui/primitives'
import { Button, Card } from '@real/ui/components'

const copy = {
  orderPlaced: 'Order placed',
  orderSuccess: 'Your order was submitted successfully.',
  orderIdLabel: 'Order ID:',
  totalLabel: 'Total:',
  placedAtLabel: 'Placed at:',
  continueShopping: 'Continue shopping',
  viewAccount: 'View account',
  errorTitle: 'Something went wrong',
  errorFallback: 'Your order could not be confirmed. Please check your account or contact support.',
  returnToShop: 'Return to shop',
} as const

type CheckoutSuccessScreenProps = {
  orderId: string
  orderTotal: string
  createdAt?: string
  error?: string | null
  onContinueShopping: () => void
  onViewAccount: () => void
}

export function CheckoutSuccessScreen({
  orderId,
  orderTotal,
  createdAt,
  error,
  onContinueShopping,
  onViewAccount,
}: CheckoutSuccessScreenProps) {
  const hasValidOrder = orderId && orderId !== 'N/A' && !error

  return (
    <PageScaffold variant='checkout' density='standard' scroll='auto'>
      <PageScaffold.Body>
        <Section>
          {hasValidOrder ? (
            <Card variant='raised' style={{ gap: spacing['16'] }}>
              <Text variant='h1'>{copy.orderPlaced}</Text>
              <Text tone='muted'>{copy.orderSuccess}</Text>
              <Box style={{ gap: spacing['8'] }}>
                <Text variant='bodySm'>{copy.orderIdLabel} {orderId}</Text>
                <Text variant='bodySm'>{copy.totalLabel} {orderTotal}</Text>
                {createdAt ? (
                  <Text variant='caption' tone='muted'>{copy.placedAtLabel} {createdAt}</Text>
                ) : null}
              </Box>
              <Box style={{ flexDirection: 'row', gap: spacing['16'], flexWrap: 'wrap' }}>
                <Box style={{ width: spacing.xxl * 4 }}>
                  <Button variant='outline' onPress={onContinueShopping}>
                    {copy.continueShopping}
                  </Button>
                </Box>
                <Box style={{ width: spacing.xxl * 4 }}>
                  <Button onPress={onViewAccount}>
                    {copy.viewAccount}
                  </Button>
                </Box>
              </Box>
            </Card>
          ) : (
            <Card variant='raised' style={{ gap: spacing['16'] }}>
              <Text variant='h1'>{copy.errorTitle}</Text>
              <Text tone='muted'>
                {error ?? copy.errorFallback}
              </Text>
              <Box style={{ flexDirection: 'row', gap: spacing['16'], flexWrap: 'wrap' }}>
                <Box style={{ width: spacing.xxl * 4 }}>
                  <Button variant='outline' onPress={onContinueShopping}>
                    {copy.returnToShop}
                  </Button>
                </Box>
                <Box style={{ width: spacing.xxl * 4 }}>
                  <Button onPress={onViewAccount}>
                    {copy.viewAccount}
                  </Button>
                </Box>
              </Box>
            </Card>
          )}
        </Section>
      </PageScaffold.Body>
    </PageScaffold>
  )
}

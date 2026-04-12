import { useTranslation } from 'react-i18next'
import { spacing } from '@real/tokens'
import { PageScaffold, Section } from '@real/ui'
import { Button, Card } from '@real/ui/components'
import { Box, Text } from '@real/ui/primitives'
import { OrderSummary } from '@real/app/lib/types'
import { useBreakpoint } from '@real/ui/responsive'
import Link from 'next/link'

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
  const { t } = useTranslation('orders')
  const profile = useBreakpoint()
  const isDesktop = profile.breakpoint === 'desktop'

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
              <Text variant='h1'>{t('title')}</Text>
              <Text tone='muted'>{t('subtitle')}</Text>
            </Box>

            {error ? (
              <Card tone='subtle' style={{ gap: spacing.sm }}>
                <Text tone='danger'>{t('error.loadFailed')}</Text>
                <Text tone='muted' variant='bodySm'>{error}</Text>
                <Button size='sm' variant='outline' onPress={onReload}>{t('actions.retry')}</Button>
              </Card>
            ) : orders.length === 0 ? (
              <Card tone='subtle' style={{ gap: spacing['8'] }}>
                <Text tone='muted'>{t('empty.message')}</Text>
                <Link href='/shop' passHref>
                  <Button size='sm'>{t('actions.browseShop')}</Button>
                </Link>
              </Card>
            ) : (
              <Box style={{ gap: spacing.md }}>
                {orders.map((order) => (
                  <Card key={order.id} variant='flat' style={{ gap: spacing['8'] }}>
                    <Text variant='label'>{t('order.orderId', { id: order.id })}</Text>
                    <Text variant='caption' tone='muted'>
                      {t('order.date', { date: new Date(order.createdAt).toLocaleDateString() })}
                    </Text>
                    <Text variant='bodySm' tone='muted'>{t('order.status', { status: order.status })}</Text>
                    <Text variant='bodySm' tone='muted'>
                      {t('order.total', { currency: order.currency, amount: order.total.toFixed(2) })}
                    </Text>
                    <Box style={isDesktop ? { width: spacing['128'] } : undefined}>
                      <Button size='sm' variant='outline' onPress={() => onSelectOrder?.(order.id)}>
                        {t('actions.viewOrder')}
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

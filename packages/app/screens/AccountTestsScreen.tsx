import { spacing } from '@real/tokens'
import { useTranslation } from 'react-i18next'
import { PageScaffold, Section } from '@real/ui'
import { Box, Text } from '@real/ui/primitives'
import { Button, Card } from '@real/ui/components'
import { AccountTestRecord } from '@real/app/lib/types'

type AccountTestsScreenProps = {
  tests?: AccountTestRecord[]
  loading?: boolean
  error?: string | null
  onReload?: () => void
  onSelectTest?: (id: string) => void
}

export function AccountTestsScreen({
  tests = [],
  loading = false,
  error = null,
  onReload,
  onSelectTest,
}: AccountTestsScreenProps) {
  const { t } = useTranslation('account')
  if (loading) {
    return (
      <PageScaffold variant='account' density='standard' scroll='auto'>
        <PageScaffold.Body>
          <Section>
            <Box gap='md'>
              <Card tone='subtle' style={{ minHeight: spacing['128'] }} />
              <Card tone='subtle' style={{ minHeight: spacing['128'] }} />
            </Box>
          </Section>
        </PageScaffold.Body>
      </PageScaffold>
    )
  }

  if (error) {
    return (
      <PageScaffold variant='account' density='standard' scroll='auto'>
        <PageScaffold.Body>
          <Section>
            <Card tone='subtle' style={{ gap: spacing['8'] }}>
              <Text tone='danger'>{t('error.loadFailed')}</Text>
              <Text tone='muted' variant='bodySm'>{error}</Text>
              <Box style={{ width: spacing['128'] }}>
                <Button variant='outline' onPress={onReload}>{t('testDetail.retry')}</Button>
              </Box>
            </Card>
          </Section>
        </PageScaffold.Body>
      </PageScaffold>
    )
  }

  return (
    <PageScaffold variant='account' density='standard' scroll='auto'>
      <PageScaffold.Body>
        <Section>
          <Box gap='16'>
            <Card variant='raised' style={{ gap: spacing['8'] }}>
              <Text variant='h1'>{t('tests.title')}</Text>
              <Text tone='muted'>{t('tests.empty')}</Text>
            </Card>

            {tests.length === 0 ? (
              <Card tone='subtle'>
                <Text tone='muted'>{t('tests.empty')}</Text>
              </Card>
            ) : (
              <Box style={{ gap: spacing['8'] }}>
                {tests.map((test) => (
                  <Card key={test.id} variant='flat' style={{ gap: spacing['4'] }}>
                    <Text variant='label'>{test.title}</Text>
                    <Text tone='muted' variant='caption'>
                      {new Date(test.createdAt).toLocaleDateString()}
                    </Text>
                    <Text tone='muted' variant='caption'>
                      Recommendations: {test.recommendedCount} • Purchased from recommendations: {test.purchasedCount}
                    </Text>
                    <Box style={{ width: spacing['128'] }}>
                      <Button size='sm' variant='outline' onPress={() => onSelectTest?.(test.id)}>
                        {t('tests.viewResult')}
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

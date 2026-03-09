import { spacing } from '@real/tokens'
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
              <Text tone='danger'>Unable to load tests.</Text>
              <Text tone='muted' variant='bodySm'>{error}</Text>
              <Box style={{ width: spacing['128'] }}>
                <Button variant='outline' onPress={onReload}>Retry</Button>
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
              <Text variant='h2'>Diagnostics tests</Text>
              <Text tone='muted'>Review your in-branch test history and recommendations.</Text>
            </Card>

            {tests.length === 0 ? (
              <Card tone='subtle'>
                <Text tone='muted'>No tests available yet.</Text>
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
                        View result
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

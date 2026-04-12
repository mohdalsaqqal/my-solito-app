import { View } from 'react-native'
import { spacing } from '@real/tokens'
import { Card } from './Card'
import { Text } from '../primitives/Text'

type MetricCardProps = {
  label: string
  value: string
  delta?: string
}

export function MetricCard({ label, value, delta }: MetricCardProps) {
  return (
    <Card
      style={{
        minHeight: 110,
        justifyContent: 'space-between',
        padding: spacing.md,
      }}
    >
      <Text variant='footer' tone='muted'>
        {label}
      </Text>
      <View style={{ gap: spacing.xs }}>
        <Text variant='subtitle'>{value}</Text>
        {delta ? (
          <Text variant='overline' tone='primary' style={{ textTransform: 'uppercase' }}>
            {delta}
          </Text>
        ) : null}
      </View>
    </Card>
  )
}

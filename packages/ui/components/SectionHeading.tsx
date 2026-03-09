import { ReactNode } from 'react'
import { View } from 'react-native'
import { spacing } from '@real/tokens'
import { Text } from '../primitives/Text'

type SectionHeadingProps = {
  eyebrow?: ReactNode
  title: ReactNode
  subtitle?: ReactNode
  action?: ReactNode
}

export function SectionHeading({ eyebrow, title, subtitle, action }: SectionHeadingProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: spacing.md,
      }}
    >
      <View style={{ flex: 1, gap: spacing.xs }}>
        {eyebrow ? (
          <Text variant='label' tone='primary' style={{ textTransform: 'uppercase' }}>
            {eyebrow}
          </Text>
        ) : null}
        <Text variant='title'>{title}</Text>
        {subtitle ? <Text tone='muted' variant='footer'>{subtitle}</Text> : null}
      </View>
      {action ? <View>{action}</View> : null}
    </View>
  )
}

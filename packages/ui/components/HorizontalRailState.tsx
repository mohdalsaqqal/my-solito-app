import { ReactNode } from 'react'
import { ScrollView } from 'react-native'
import { spacing } from '@real/tokens'
import { Box, Text, Touchable } from '../primitives'
import { Card } from './Card'

type HorizontalRailStateProps = {
  loading?: boolean
  error?: string | null
  isEmpty?: boolean
  onRetry?: () => void
  emptyMessage: string
  loadingCount: number
  loadingItem: (key: number) => ReactNode
  children: ReactNode
}

export function HorizontalRailState({
  loading = false,
  error,
  isEmpty = false,
  onRetry,
  emptyMessage,
  loadingCount,
  loadingItem,
  children,
}: HorizontalRailStateProps) {
  if (loading) {
    return (
      <ScrollView
        horizontal
        nestedScrollEnabled
        directionalLockEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: spacing.xs }}
      >
        {Array.from({ length: loadingCount }, (_, key) => loadingItem(key))}
      </ScrollView>
    )
  }

  if (error) {
    return (
      <Card tone='subtle' radiusKey='xs'>
        <Box style={{ gap: spacing.sm }}>
          <Text tone='danger' variant='bodySm'>
            {error}
          </Text>
          <Touchable onPress={onRetry}>
            <Text tone='primary' variant='label'>
              Retry
            </Text>
          </Touchable>
        </Box>
      </Card>
    )
  }

  if (isEmpty) {
    return (
      <Card tone='subtle' radiusKey='xs'>
        <Text tone='muted'>{emptyMessage}</Text>
      </Card>
    )
  }

  return (
    <ScrollView
      horizontal
      nestedScrollEnabled
      directionalLockEnabled
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: spacing.xs }}
    >
      {children}
    </ScrollView>
  )
}

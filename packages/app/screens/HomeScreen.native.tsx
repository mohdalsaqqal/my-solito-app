/**
 * Native override for HomeScreen.
 *
 * Metro resolves this file on iOS/Android instead of HomeScreen.tsx.
 * The only difference: wraps the shared content in a ScrollView,
 * which native screens need but web handles via the browser's own scroll.
 */
import { ScrollView } from 'react-native'
import { HomeScreen as HomeScreenShared } from './HomeScreen'
import type { ComponentProps } from 'react'

type Props = ComponentProps<typeof HomeScreenShared>

export function HomeScreen(props: Props) {
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
    >
      <HomeScreenShared {...props} />
    </ScrollView>
  )
}

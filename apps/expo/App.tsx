import { Fragment, useEffect } from 'react'
import { PortalHost } from '@rn-primitives/portal'
import { Platform } from 'react-native'
import { FullWindowOverlay } from 'react-native-screens'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { ToastProvider } from '@real/ui'
import HomeRoute from './app/index'
import { registerPushNotifications } from './app/registerPushNotifications'

export default function App() {
  const Overlay = Platform.OS === 'ios' ? FullWindowOverlay : Fragment

  useEffect(() => {
    registerPushNotifications().then((result) => {
      if (__DEV__ && result.status === 'skipped') {
        console.log(`[push] ${result.reason}`)
      }
    })
  }, [])

  return (
    <SafeAreaProvider>
      <ToastProvider>
        <HomeRoute />
        <Overlay>
          <PortalHost />
        </Overlay>
      </ToastProvider>
    </SafeAreaProvider>
  )
}

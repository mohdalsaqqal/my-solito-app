import { SafeAreaProvider } from 'react-native-safe-area-context'
import { ToastProvider } from '@real/ui'
import HomeRoute from './app/index'

export default function App() {
  return (
    <SafeAreaProvider>
      <ToastProvider>
        <HomeRoute />
      </ToastProvider>
    </SafeAreaProvider>
  )
}

import { SafeAreaProvider } from 'react-native-safe-area-context'
import HomeRoute from './app/index'

export default function App() {
  return (
    <SafeAreaProvider>
      <HomeRoute />
    </SafeAreaProvider>
  )
}

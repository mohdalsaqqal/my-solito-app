import { CartProvider } from 'app/provider/cart'
import { SafeArea } from 'app/provider/safe-area'
import { NavigationProvider } from './navigation'

export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <SafeArea>
        <NavigationProvider>{children}</NavigationProvider>
      </SafeArea>
    </CartProvider>
  )
}

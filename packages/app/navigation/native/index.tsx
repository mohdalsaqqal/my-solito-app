import { createNativeStackNavigator } from '@react-navigation/native-stack'

import { HomeScreen } from 'app/features/home/screen'
import { CartScreen } from 'app/features/cart/cart-screen'
import { ProductDetailScreen } from 'app/features/products/detail-screen'
import { ProductListScreen } from 'app/features/products/list-screen'
import { TestScreen } from 'app/features/test/screen'
import { UserDetailScreen } from 'app/features/user/detail-screen'

const Stack = createNativeStackNavigator<{
  home: undefined
  test: undefined
  cart: undefined
  'product-list': undefined
  'product-list-category': { categorySlug: string }
  'product-detail': { slug: string }
  'user-detail': { id: string }
}>()

export function NativeNavigation() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="home"
        component={HomeScreen}
        options={{
          title: 'Home',
        }}
      />
      <Stack.Screen
        name="test"
        component={TestScreen}
        options={{ title: 'Uniwind Test' }}
      />
      <Stack.Screen
        name="product-list"
        component={ProductListScreen}
        options={{ title: 'Products' }}
      />
      <Stack.Screen
        name="product-list-category"
        component={ProductListScreen}
        options={({ route }) => ({ title: route.params.categorySlug ?? 'Products' })}
      />
      <Stack.Screen
        name="product-detail"
        component={ProductDetailScreen}
        options={{ title: 'Product' }}
      />
      <Stack.Screen
        name="cart"
        component={CartScreen}
        options={{ title: 'Cart' }}
      />
      <Stack.Screen
        name="user-detail"
        component={UserDetailScreen}
        options={{
          title: 'User',
        }}
      />
    </Stack.Navigator>
  )
}

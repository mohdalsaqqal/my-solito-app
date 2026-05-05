'use client'

import { useMemo } from 'react'
import { TextLink } from 'solito/link'
import { Box, Text } from 'app/components/uniwind-box'
import { useCart } from 'app/provider/cart/cart-context'
import { MOCK_PRODUCTS } from 'app/logic/data/mock-products'

export function CartScreen() {
  const { cart } = useCart()

  const lines = useMemo(() => {
    return cart.items.map((item) => {
      const product = MOCK_PRODUCTS.find((p) => p.id === item.productId)
      return product
        ? { product, quantity: item.quantity, subtotal: product.price * item.quantity }
        : null
    }).filter(Boolean) as { product: (typeof MOCK_PRODUCTS)[0]; quantity: number; subtotal: number }[]
  }, [cart.items])

  const total = useMemo(() => lines.reduce((sum, l) => sum + l.subtotal, 0), [lines])

  if (lines.length === 0) {
    return (
      <Box className="flex-1 justify-center items-center p-4 bg-gray-50">
        <Text className="text-lg text-gray-600">Your cart is empty</Text>
        <TextLink href="/products" className="mt-4 text-blue-600 font-medium">
          Browse products
        </TextLink>
      </Box>
    )
  }

  return (
    <Box className="flex-1 bg-gray-50 p-4">
      <Text className="text-xl font-bold text-gray-900">Cart</Text>
      <Box className="mt-4 gap-4">
        {lines.map(({ product, quantity, subtotal }) => (
          <Box
            key={product.id}
            className="flex flex-row justify-between items-center p-3 bg-white rounded-lg border border-gray-200"
          >
            <Box>
              <Text className="font-medium text-gray-900">{product.name}</Text>
              <Text className="text-sm text-gray-600">
                ${product.price.toFixed(2)} × {quantity}
              </Text>
            </Box>
            <Text className="font-semibold text-gray-900">
              ${subtotal.toFixed(2)}
            </Text>
          </Box>
        ))}
      </Box>
      <Box className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
        <Box className="flex flex-row justify-between">
          <Text className="font-bold text-gray-900">Total</Text>
          <Text className="font-bold text-gray-900">${total.toFixed(2)}</Text>
        </Box>
      </Box>
      <TextLink
        href="/products"
        className="inline-block mt-6 text-blue-600 font-medium"
      >
        ← Continue shopping
      </TextLink>
    </Box>
  )
}

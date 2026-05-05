'use client'

import { useMemo } from 'react'
import { Image } from 'react-native'
import { TextLink } from 'solito/link'
import { useParams } from 'solito/navigation'
import { Box, Text } from 'app/components/uniwind-box'
import { getProductBySlug } from 'app/logic/api/products'
import { useCart } from 'app/provider/cart/cart-context'
import { AddToCartButton } from './add-to-cart-button'

export function ProductDetailScreen() {
  const params = useParams<{ slug: string }>()
  const slug = params?.slug ?? ''
  const product = useMemo(() => getProductBySlug(slug), [slug])
  const { addItem } = useCart()

  if (!product) {
    return (
      <Box className="flex-1 justify-center items-center p-4 bg-gray-50">
        <Text className="text-lg text-gray-600">Product not found</Text>
        <TextLink href="/products" className="mt-4 text-blue-600 font-medium">
          Back to products
        </TextLink>
      </Box>
    )
  }

  return (
    <Box className="flex-1 bg-gray-50">
      <Box className="bg-white border-b border-gray-200">
        <Box className="w-full aspect-square max-w-md mx-auto bg-gray-100">
          <Image
            source={{ uri: product.imageUrl }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        </Box>
      </Box>
      <Box className="p-4">
        <Text className="text-2xl font-bold text-gray-900">{product.name}</Text>
        <Text className="text-xl font-bold text-gray-900 mt-2">
          ${product.price.toFixed(2)}
        </Text>
        <Text className="text-gray-700 mt-3">{product.description}</Text>
        {product.inStock ? (
          <AddToCartButton
            onPress={() => addItem(product.id, 1)}
            className="mt-6"
          />
        ) : (
          <Text className="mt-4 text-red-600 font-medium">Out of stock</Text>
        )}
        <TextLink
          href="/products"
          className="inline-block mt-4 text-blue-600 font-medium"
        >
          ← Back to products
        </TextLink>
      </Box>
    </Box>
  )
}

'use client'

import { Image } from 'react-native'
import { TextLink } from 'solito/link'
import { Box, Text } from 'app/components/uniwind-box'
import type { Product } from 'app/logic/types/product'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <TextLink
      href={`/products/${product.slug}`}
      className="w-[160px] rounded-xl bg-white shadow border border-gray-200 overflow-hidden"
    >
      <Box className="w-full aspect-square bg-gray-100">
        <Image
          source={{ uri: product.imageUrl }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
      </Box>
      <Box className="p-3">
        <Text className="text-sm font-semibold text-gray-900 line-clamp-2">
          {product.name}
        </Text>
        <Text className="text-base font-bold text-gray-900 mt-1">
          ${product.price.toFixed(2)}
        </Text>
      </Box>
    </TextLink>
  )
}

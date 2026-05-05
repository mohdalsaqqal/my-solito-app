'use client'

import { useMemo } from 'react'
import { TextLink } from 'solito/link'
import { useParams } from 'solito/navigation'
import { Box, Text } from 'app/components/uniwind-box'
import { getProducts, getCategories } from 'app/logic/api/products'
import { ProductCard } from './product-card'

export function ProductListScreen() {
  const params = useParams<{ categorySlug?: string }>()
  const categorySlug = params?.categorySlug
  const products = useMemo(() => getProducts(categorySlug), [categorySlug])
  const categories = useMemo(() => getCategories(), [])

  return (
    <Box className="flex-1 bg-gray-50">
      <Box className="p-4 border-b border-gray-200 bg-white">
        <Text className="text-xl font-bold text-gray-900">Cosmetics</Text>
        <Text className="text-sm text-gray-600 mt-1">
          Browse by category
        </Text>
        <Box className="flex flex-row flex-wrap gap-2 mt-3">
          {categories.map((cat) => (
            <TextLink
              key={cat.id}
              href={`/products/category/${cat.slug}`}
              className="px-3 py-1.5 rounded-full bg-gray-200 text-gray-800 text-sm font-medium"
            >
              {cat.name}
            </TextLink>
          ))}
          <TextLink
            href="/products"
            className="px-3 py-1.5 rounded-full bg-gray-800 text-white text-sm font-medium"
          >
            All
          </TextLink>
        </Box>
      </Box>
      <Box className="p-4 flex flex-row flex-wrap gap-4 justify-center">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </Box>
    </Box>
  )
}

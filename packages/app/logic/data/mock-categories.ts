import type { Category } from '../types/product'
import { MOCK_PRODUCTS } from './mock-products'

const categoryCounts = MOCK_PRODUCTS.reduce<Record<string, number>>((acc, p) => {
  acc[p.categoryId] = (acc[p.categoryId] ?? 0) + 1
  return acc
}, {})

export const MOCK_CATEGORIES: Category[] = [
  { id: 'skincare', slug: 'skincare', name: 'Skincare', productCount: categoryCounts['skincare'] ?? 0 },
  { id: 'makeup', slug: 'makeup', name: 'Makeup', productCount: categoryCounts['makeup'] ?? 0 },
]

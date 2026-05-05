import type { Product, Category } from '../types/product'
import { MOCK_PRODUCTS } from '../data/mock-products'
import { MOCK_CATEGORIES } from '../data/mock-categories'

/** Get all products. Later: replace with Odoo API. */
export function getProducts(categorySlug?: string): Product[] {
  if (!categorySlug) return [...MOCK_PRODUCTS]
  return MOCK_PRODUCTS.filter((p) => {
    const cat = MOCK_CATEGORIES.find((c) => c.slug === categorySlug)
    return cat && p.categoryId === cat.id
  })
}

/** Get one product by slug. Later: replace with Odoo API. */
export function getProductBySlug(slug: string): Product | undefined {
  return MOCK_PRODUCTS.find((p) => p.slug === slug)
}

/** Get all categories. Later: replace with Odoo API. */
export function getCategories(): Category[] {
  return [...MOCK_CATEGORIES]
}

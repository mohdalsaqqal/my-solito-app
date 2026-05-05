/**
 * Shared e-commerce types (mock now; replace with Odoo later).
 */

export type ProductId = string

export interface Product {
  id: ProductId
  slug: string
  name: string
  description: string
  price: number
  currency: string
  imageUrl: string
  categoryId: string
  inStock: boolean
}

export interface Category {
  id: string
  slug: string
  name: string
  productCount: number
}

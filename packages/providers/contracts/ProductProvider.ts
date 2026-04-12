import { ProviderResult } from './types'
import { ProductFilter } from './CatalogProviders'
import { CanonicalEntity } from './EntityMapping'

export type Product = CanonicalEntity & {
  id: string
  name: string
  description?: string
  price: number
  compareAtPrice?: number
  currency: string
  image?: string
  rating?: number
  reviews?: number
  isNew?: boolean
  isLimited?: boolean
  stock?: number
  brand?: string
  category?: string
  manualRelatedIds?: string[]
  crossSellIds?: string[]
  completeSetIds?: string[]
}

export type ProductPricingSnapshot = {
  productId: string
  unitPrice: number
  currency: string
  compareAtPrice?: number
  source: 'catalog' | 'odoo'
  resolvedAt: string
}

export type ProductInventorySnapshot = {
  productId: string
  availableQuantity: number
  isInStock: boolean
  source: 'catalog' | 'odoo'
  resolvedAt: string
}

export type ProductIntegrationSnapshot = {
  productId: string
  externalProductId?: string
  pricing: ProductPricingSnapshot
  inventory: ProductInventorySnapshot
}

export interface ProductProvider {
  list(filters?: ProductFilter): Promise<ProviderResult<Product[]>>
  get(id: string): Promise<ProviderResult<Product>>
  getIntegrationSnapshot?(id: string): Promise<ProviderResult<ProductIntegrationSnapshot>>
}

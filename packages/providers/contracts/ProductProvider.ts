import { ProviderResult } from './types'
import { ProductFilter } from './CatalogProviders'

export type Product = {
  id: string
  name: string
  description?: string
  price: number
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

export interface ProductProvider {
  list(filters?: ProductFilter): Promise<ProviderResult<Product[]>>
  get(id: string): Promise<ProviderResult<Product>>
}

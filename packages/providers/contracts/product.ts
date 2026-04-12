import { AdminListInput, FieldRegistryResponse, PagedResponse, ProviderResult } from './types'

export type ProductRow = {
  id: string
  title: string
  brand?: string
  category?: string
  price?: number
  comparePrice?: number
  inventory?: number
  status?: string
  sku?: string
  image?: string
  vendor?: string
  updatedAt?: string
  customFields?: Record<string, unknown>
}

export type ProductDetail = ProductRow & {
  description?: string
  currency?: string
  sales?: number
  variantCount?: number
  sourceColumns?: string[]
  createdAt?: string
}

export type ProductUpsertInput = {
  title: string
  brand?: string
  category?: string
  price?: number
  comparePrice?: number
  inventory?: number
  status?: string
  sku?: string
  image?: string
  vendor?: string
  description?: string
  currency?: string
  sales?: number
  variantCount?: number
  customFields?: Record<string, unknown>
}

export type ProductActionInput = {
  action: 'activate' | 'deactivate' | 'archive' | 'assign-category' | 'assign-vendor'
  input?: Record<string, unknown>
}

export interface AdminProductProvider {
  listProducts(input: AdminListInput): Promise<ProviderResult<PagedResponse<ProductRow>>>
  productFields(): Promise<ProviderResult<FieldRegistryResponse>>
  getProduct(id: string): Promise<ProviderResult<ProductDetail>>
  createProduct(input: ProductUpsertInput): Promise<ProviderResult<ProductDetail>>
  updateProduct(id: string, input: Partial<ProductUpsertInput>): Promise<ProviderResult<ProductDetail>>
  runProductAction(id: string, input: ProductActionInput): Promise<ProviderResult<ProductDetail>>
}

import { ProviderResult } from './types'

export type LocalizedString = {
  en: string
  ar: string
}

export type ProductFilter = {
  brand?: string[]
  category?: string[]
  ids?: string[]
  onSale?: boolean
  sort?: 'newest' | 'bestseller' | 'price_asc' | 'price_desc'
  limit?: number
}

export type ProductQuery = {
  slug: string
  filters: ProductFilter
  active: boolean
  title?: LocalizedString
}

export type Category = {
  id: string
  slug: string
  name: LocalizedString
  parentId?: string
  image?: string
  isActive: boolean
  sortOrder: number
}

export type CategoryTreeNode = Category & {
  children: CategoryTreeNode[]
}

export interface CategoryProvider {
  list(): Promise<ProviderResult<Category[]>>
  tree(): Promise<ProviderResult<CategoryTreeNode[]>>
  getBySlug(slug: string): Promise<ProviderResult<Category>>
}

export type Brand = {
  id: string
  slug: string
  name: LocalizedString
  logo?: string
  description?: LocalizedString
  isActive: boolean
}

export interface BrandProvider {
  list(): Promise<ProviderResult<Brand[]>>
  getBySlug(slug: string): Promise<ProviderResult<Brand>>
}

export interface ProductQueryProvider {
  list(): Promise<ProviderResult<ProductQuery[]>>
  getBySlug(slug: string): Promise<ProviderResult<ProductQuery>>
  create(input: ProductQuery): Promise<ProviderResult<ProductQuery>>
  delete(slug: string): Promise<ProviderResult<{ slug: string; deleted: true }>>
  update(
    slug: string,
    input: Partial<{
      filters: ProductFilter
      active: boolean
      title: LocalizedString
    }>
  ): Promise<ProviderResult<ProductQuery>>
}

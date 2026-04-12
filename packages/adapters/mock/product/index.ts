import { Product, ProductProvider, ProductFilter } from '@real/providers/contracts'
import { generatedMockProductRows } from './generated-mock-erp-data'
import { buildCanonicalMetadata } from '../_shared/canonical-mapper'

type SourceProductRow = {
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
  external_product_id: string
  vendor_sku: string
  erp_line_code: string
  inventory_bin?: string
  formulation_family?: string
  shelf_life_months?: number
  compliance_tags?: string[]
  price_band?: 'entry' | 'mid' | 'premium'
  source_csv_item_id?: string
  source_row_number?: number
  meta_title?: string
  meta_description?: string
  key_features?: string[]
  how_to_use?: string
  seo_keywords?: string[]
  product_tags?: string[]
  csv_brand_label?: string
  brand_confidence?: 'high' | 'low'
}

const sourceProducts: SourceProductRow[] = generatedMockProductRows as SourceProductRow[]

const canonicalProductKeys = [
  'id',
  'name',
  'description',
  'price',
  'currency',
  'image',
  'rating',
  'reviews',
  'isNew',
  'isLimited',
  'stock',
  'brand',
  'category',
  'manualRelatedIds',
  'crossSellIds',
  'completeSetIds',
] as const

function toCanonicalProduct(row: SourceProductRow): Product {
  const metadata = buildCanonicalMetadata({
    row: row as unknown as Record<string, unknown>,
    canonicalKeys: canonicalProductKeys,
    system: 'mock-erp',
    table: 'products',
    schemaVersion: '2026-03-15',
    externalIdField: 'external_product_id',
  })

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    currency: row.currency,
    image: row.image,
    rating: row.rating,
    reviews: row.reviews,
    isNew: row.isNew,
    isLimited: row.isLimited,
    stock: row.stock,
    brand: row.brand,
    category: row.category,
    manualRelatedIds: row.manualRelatedIds,
    crossSellIds: row.crossSellIds,
    completeSetIds: row.completeSetIds,
    ...metadata,
  }
}

const mockProducts = sourceProducts.map(toCanonicalProduct)

function normalizeSet(values?: string[]) {
  if (!values || values.length === 0) return null
  return new Set(values.map((item) => item.trim().toLowerCase()).filter(Boolean))
}

function detectOnSale(item: Product) {
  const normalized = `${item.name} ${item.description ?? ''}`.toLowerCase()
  return normalized.includes('sale') || normalized.includes('off') || normalized.includes('%') || Boolean(item.isLimited)
}

function applySort(list: Product[], sort?: ProductFilter['sort']) {
  const copy = [...list]
  switch (sort) {
    case 'price_asc':
      return copy.sort((a, b) => a.price - b.price)
    case 'price_desc':
      return copy.sort((a, b) => b.price - a.price)
    case 'bestseller':
      return copy.sort((a, b) => (b.reviews ?? 0) - (a.reviews ?? 0))
    case 'newest':
      return copy.reverse()
    default:
      return copy
  }
}

function applyFilters(list: Product[], filter?: ProductFilter) {
  if (!filter) return list

  const brandSet = normalizeSet(filter.brand)
  const categorySet = normalizeSet(filter.category)
  const idSet = normalizeSet(filter.ids)

  let filtered = list.filter((item) => {
    if (brandSet && !brandSet.has((item.brand ?? '').toLowerCase())) return false
    if (categorySet && !categorySet.has((item.category ?? '').toLowerCase())) return false
    if (idSet && !idSet.has(item.id.toLowerCase())) return false
    if (filter.onSale && !detectOnSale(item)) return false
    return true
  })

  filtered = applySort(filtered, filter.sort)

  if (typeof filter.limit === 'number' && filter.limit > 0) {
    filtered = filtered.slice(0, filter.limit)
  }

  return filtered
}

export const mockProductAdapter: ProductProvider = {
  async list(filters?: ProductFilter) {
    return { ok: true, data: applyFilters(mockProducts, filters) }
  },
  async get(id: string) {
    const product = mockProducts.find((item) => item.id === id)
    if (!product) {
      return {
        ok: false,
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: 'The requested product does not exist.',
        },
      }
    }

    return { ok: true, data: product }
  },
}

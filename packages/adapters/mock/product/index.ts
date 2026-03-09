import { Product, ProductProvider, ProductFilter } from '@real/providers/contracts'

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Yves Saint Laurent - Libre Berry Crush Eau De Parfum',
    description: 'Floral berry fragrance.',
    price: 42,
    currency: 'USD',
    image:
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1200&h=1500&q=85',
    rating: 4.8,
    reviews: 212,
    isNew: true,
    stock: 15,
    brand: 'yves-saint-laurent',
    category: 'makeup',
    manualRelatedIds: ['3', '4'],
    crossSellIds: ['5'],
    completeSetIds: ['3', '4', '5'],
  },
  {
    id: '2',
    name: 'IGK - Expensive Hi-Shine Gloss Treatment',
    description: 'High-shine treatment for dull hair.',
    price: 28,
    currency: 'USD',
    image:
      'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=1200&h=1500&q=85',
    rating: 4.5,
    reviews: 98,
    stock: 0,
    brand: 'igk',
    category: 'haircare',
    manualRelatedIds: ['3'],
    crossSellIds: ['6'],
    completeSetIds: ['2', '6'],
  },
  {
    id: '3',
    name: 'Fenty Beauty - Gloss Bomb Stix High-Shine Gloss Stick',
    description: 'Hydrating high-shine color.',
    price: 24,
    currency: 'USD',
    image:
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1200&h=1500&q=85',
    rating: 4.7,
    reviews: 184,
    stock: 9,
    brand: 'fenty-beauty',
    category: 'makeup',
    manualRelatedIds: ['4', '5'],
    crossSellIds: ['1'],
    completeSetIds: ['3', '4', '5'],
  },
  {
    id: '4',
    name: 'Huda Beauty - Faux Filler Extra Shine Lip Gloss',
    description: 'Volumizing gloss finish.',
    price: 21,
    currency: 'USD',
    image:
      'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&w=1200&h=1500&q=85',
    rating: 4.4,
    reviews: 142,
    isLimited: true,
    stock: 2,
    brand: 'huda-beauty',
    category: 'makeup',
    manualRelatedIds: ['3', '5'],
    crossSellIds: ['1'],
    completeSetIds: ['3', '4', '5'],
  },
  {
    id: '5',
    name: 'Dior - Addict Lip Glow Oil Berry',
    description: 'Tinted lip oil with shine.',
    price: 34,
    currency: 'USD',
    image:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&h=1500&q=85',
    rating: 4.9,
    reviews: 301,
    isLimited: true,
    stock: 1,
    brand: 'dior',
    category: 'makeup',
    manualRelatedIds: ['3', '4'],
    crossSellIds: ['1'],
    completeSetIds: ['3', '4', '5'],
  },
  {
    id: '6',
    name: 'Rare Beauty - Soft Pinch Tinted Lip Oil',
    description: 'Lightweight oil tint.',
    price: 22,
    currency: 'USD',
    image:
      'https://images.unsplash.com/photo-1631214524020-3d3736ee2f53?auto=format&fit=crop&w=1200&h=1500&q=85',
    rating: 4.3,
    reviews: 77,
    stock: 0,
    brand: 'rare-beauty',
    category: 'makeup',
    manualRelatedIds: ['3', '4'],
    crossSellIds: ['2'],
    completeSetIds: ['2', '6'],
  },
]

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

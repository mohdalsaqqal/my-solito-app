import { Product, ProductFilter } from './types'

function hasSaleTag(item: Product) {
  const normalized = `${item.name} ${item.description ?? ''}`.toLowerCase()
  return normalized.includes('sale') || normalized.includes('off') || normalized.includes('%') || Boolean(item.isLimited)
}

export function applyProductFilter(input: Product[], filter?: ProductFilter): Product[] {
  if (!filter) {
    return input
  }

  const normalizedBrand = new Set((filter.brand ?? []).map((item) => item.toLowerCase()))
  const normalizedCategory = new Set((filter.category ?? []).map((item) => item.toLowerCase()))
  const normalizedIds = new Set((filter.ids ?? []).map((item) => item.toLowerCase()))

  let list = input.filter((item) => {
    const brandOk = normalizedBrand.size === 0 || normalizedBrand.has((item.brand ?? '').toLowerCase())
    const categoryOk = normalizedCategory.size === 0 || normalizedCategory.has((item.category ?? '').toLowerCase())
    const idOk = normalizedIds.size === 0 || normalizedIds.has(item.id.toLowerCase())
    const saleOk = !filter.onSale || hasSaleTag(item)
    return brandOk && categoryOk && idOk && saleOk
  })

  if (filter.sort === 'newest') {
    list = [...list].reverse()
  } else if (filter.sort === 'bestseller') {
    list = [...list].sort((a, b) => (b.reviews ?? 0) - (a.reviews ?? 0))
  } else if (filter.sort === 'price_asc') {
    list = [...list].sort((a, b) => a.price - b.price)
  } else if (filter.sort === 'price_desc') {
    list = [...list].sort((a, b) => b.price - a.price)
  }

  if (typeof filter.limit === 'number' && filter.limit > 0) {
    list = list.slice(0, filter.limit)
  }

  return list
}

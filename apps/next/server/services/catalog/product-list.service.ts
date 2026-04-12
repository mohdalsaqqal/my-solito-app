import { productProvider } from '@real/providers'
import { type ProductFilter } from '@real/providers/contracts'
import type { ProviderResult } from '@real/providers/contracts'
import type { Product } from '@real/app/lib/types'

function parseArray(value: string | null): string[] | undefined {
  if (!value) return undefined
  const list = value.split(',').map((item) => item.trim()).filter(Boolean)
  return list.length > 0 ? list : undefined
}

export function parseProductListFilter(request: Request): ProductFilter {
  const url = new URL(request.url)
  const sortValue = url.searchParams.get('sort')
  const limitRaw = url.searchParams.get('limit')
  const limit = limitRaw ? Number.parseInt(limitRaw, 10) : undefined

  const sort =
    sortValue === 'newest' ||
    sortValue === 'bestseller' ||
    sortValue === 'price_asc' ||
    sortValue === 'price_desc'
      ? sortValue
      : undefined

  return {
    brand: parseArray(url.searchParams.get('brand')),
    category: parseArray(url.searchParams.get('category')),
    ids: parseArray(url.searchParams.get('ids')),
    onSale: url.searchParams.get('onSale') === '1' || url.searchParams.get('onSale') === 'true',
    sort,
    limit: Number.isFinite(limit) && (limit ?? 0) > 0 ? limit : undefined,
  }
}

export async function listProducts(filter?: ProductFilter) {
  return productProvider.list(filter)
}

export async function listProductsForRequest(request: Request) {
  const filter = parseProductListFilter(request)
  return listProducts(filter)
}

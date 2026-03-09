import { matchProviderResult } from '@real/providers/contracts'
import { productProvider } from '@real/providers'
import { fail, ok } from '../_lib/response'
import { ProductFilter } from '@real/providers/contracts'

function parseArray(value: string | null): string[] | undefined {
  if (!value) return undefined
  const list = value.split(',').map((item) => item.trim()).filter(Boolean)
  return list.length > 0 ? list : undefined
}

function parseFilter(request: Request): ProductFilter {
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

export async function GET(request: Request) {
  try {
    const filter = parseFilter(request)
    const result = await productProvider.list(filter)
    return matchProviderResult(result, {
      ok: (data) => ok(data),
      fail: (error) => fail(error.code, error.message, 500),
    })
  } catch (cause) {
    return fail(
      'PRODUCT_LIST_UNEXPECTED',
      'Unexpected error while fetching products.',
      500,
      { scope: 'GET /api/products', cause }
    )
  }
}

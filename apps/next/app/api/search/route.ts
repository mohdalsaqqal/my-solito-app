import { productProvider } from '@real/providers'
import { matchProviderResult } from '@real/providers/contracts'
import { fail, ok } from '../_lib/response'
import { passThroughPricingService } from '@real/app/lib/pricing'

type SearchItem = {
  id: string
  label: string
  type: 'product' | 'category' | 'brand'
  href: string
  imageUrl?: string
  brandName?: string
  productName?: string
  price?: number
  compareAtPrice?: number
  discountLabel?: string
}

type SearchPayload = {
  suggestions: SearchItem[]
  trendingSearches: string[]
  popularBrands: string[]
}

function normalize(input: string) {
  return input.trim().toLowerCase()
}

function extractBrand(name: string) {
  const [left] = name.split('-')
  const candidate = (left ?? '').trim()
  if (!candidate) {
    return 'Brand'
  }
  return candidate
}

function extractProductName(name: string) {
  const split = name.split('-')
  if (split.length < 2) {
    return name.trim()
  }
  return split.slice(1).join('-').trim()
}

function buildProductSuggestions(
  products: Array<{ id: string; name: string; description?: string; price: number; currency: string; image?: string }>,
  query: string
) {
  const q = normalize(query)
  const filtered = q
    ? products.filter((product) => {
        const haystack = [product.name, product.description ?? '', extractBrand(product.name)]
          .join(' ')
          .toLowerCase()
        return haystack.includes(q)
      })
    : products

  return filtered.slice(0, 7).map((product) => {
    const brandName = extractBrand(product.name)
    const resolvedPrice = passThroughPricingService.getProductPrice({
      price: product.price,
      currency: product.currency,
    })
    return {
      id: `p-${product.id}`,
      label: product.name,
      type: 'product' as const,
      href: `/product/${product.id}`,
      imageUrl: product.image || undefined,
      brandName,
      productName: extractProductName(product.name),
      price: resolvedPrice.unitPrice,
    }
  })
}

function buildBrandSuggestions(products: Array<{ name: string }>, query: string) {
  const seen = new Set<string>()
  const q = normalize(query)
  const brands: string[] = []

  for (const product of products) {
    const brand = extractBrand(product.name)
    const key = brand.toLowerCase()
    if (seen.has(key)) {
      continue
    }
    if (q && !key.includes(q)) {
      continue
    }
    seen.add(key)
    brands.push(brand)
  }

  return brands.slice(0, 6).map((brand, index) => ({
    id: `b-${index}`,
    label: brand,
    type: 'brand' as const,
    href: `/brands/${encodeURIComponent(brand.toLowerCase().replace(/\s+/g, '-'))}`,
  }))
}

function buildTrending(products: Array<{ name: string }>) {
  const words = new Map<string, number>()
  for (const product of products) {
    for (const token of product.name.toLowerCase().split(/\s+/)) {
      const clean = token.replace(/[^a-z0-9]/g, '')
      if (clean.length < 3) {
        continue
      }
      words.set(clean, (words.get(clean) ?? 0) + 1)
    }
  }

  const sorted = Array.from(words.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([token]) => token)
  return sorted.slice(0, 6)
}

function buildPopularBrands(products: Array<{ name: string }>) {
  const counts = new Map<string, number>()
  for (const product of products) {
    const brand = extractBrand(product.name)
    counts.set(brand, (counts.get(brand) ?? 0) + 1)
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([brand]) => brand)
    .slice(0, 6)
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') ?? ''

    const result = await productProvider.list()
    return matchProviderResult(result, {
      ok: (products) => {
        const productSuggestions = buildProductSuggestions(products, query)
        const brandSuggestions = query ? buildBrandSuggestions(products, query) : []
        const suggestions: SearchItem[] = [...brandSuggestions, ...productSuggestions]
        const payload: SearchPayload = {
          suggestions,
          trendingSearches: buildTrending(products),
          popularBrands: buildPopularBrands(products),
        }
        return ok(payload)
      },
      fail: (error) => fail(error.code, error.message, 500),
    })
  } catch (cause) {
    return fail('SEARCH_UNEXPECTED', 'Unexpected error while fetching search suggestions.', 500, {
      scope: 'GET /api/search',
      cause,
    })
  }
}

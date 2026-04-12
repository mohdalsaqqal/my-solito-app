import type { SearchSuggestion } from '@real/app/lib/types'
import type { Product } from '@real/app/lib/types'
import type { HomeProductItem } from '@real/ui/components/home/types'
import type {
  ProductCardBadge,
  ProductCardModel,
} from '@real/ui/components/ProductCard.types'

const DEFAULT_CURRENCY = 'USD'
const FALLBACK_IMAGE = '/brand-logo-placeholder.svg'

function resolveLocale(locale: 'en' | 'ar') {
  return locale === 'ar' ? 'ar-JO' : 'en-US'
}

function formatPrice(amount: number, currency: string, locale: 'en' | 'ar') {
  return new Intl.NumberFormat(resolveLocale(locale), {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

function buildDiscountBadge(
  price: number,
  compareAtPrice: number | undefined,
): ProductCardBadge | null {
  if (!compareAtPrice || compareAtPrice <= price || compareAtPrice <= 0) {
    return null
  }

  const percent = Math.max(1, Math.round(((compareAtPrice - price) / compareAtPrice) * 100))
  return {
    kind: 'discount',
    label: `-${percent}%`,
  }
}

function hasBundleLabel(value: string | undefined) {
  const normalized = value?.trim().toLowerCase() ?? ''
  return normalized.includes('bundle') || normalized.includes('set') || normalized.includes('kit') || normalized.includes('routine')
}

function appendUniqueBadge(
  badges: ProductCardBadge[],
  nextBadge: ProductCardBadge | null,
) {
  if (!nextBadge) return
  if (badges.some((badge) => badge.kind === nextBadge.kind && badge.label === nextBadge.label)) {
    return
  }
  badges.push(nextBadge)
}

function buildBadgesFromProduct(
  product: Product,
  price: number,
  locale: 'en' | 'ar',
): ProductCardBadge[] | undefined {
  const badges: ProductCardBadge[] = []

  appendUniqueBadge(badges, buildDiscountBadge(price, product.compareAtPrice))

  if (product.isNew) {
    badges.push({
      kind: 'new',
      label: locale === 'ar' ? 'جديد' : 'New',
    })
  }

  if ((product.rating ?? 0) >= 4.5 || (product.reviews ?? 0) >= 50) {
    badges.push({
      kind: 'bestseller',
      label: locale === 'ar' ? 'الأكثر مبيعاً' : 'Bestseller',
    })
  }

  if (hasBundleLabel(product.name)) {
    badges.push({
      kind: 'bundle',
      label: locale === 'ar' ? 'مجموعة' : 'Bundle',
    })
  }

  return badges.length > 0 ? badges : undefined
}

function buildBadgesFromHomeItem(
  item: HomeProductItem,
  locale: 'en' | 'ar',
): ProductCardBadge[] | undefined {
  const badges: ProductCardBadge[] = []
  appendUniqueBadge(badges, buildDiscountBadge(item.price, item.compareAtPrice))

  if (item.badge) {
    const normalized = item.badge.trim().toLowerCase()
    if (normalized.includes('%') || normalized.includes('save') || normalized.includes('خصم')) {
      badges.push({ kind: 'discount', label: item.badge })
    } else if (normalized.includes('best')) {
      badges.push({ kind: 'bestseller', label: item.badge })
    } else if (normalized.includes('bundle') || normalized.includes('set') || normalized.includes('kit')) {
      badges.push({ kind: 'bundle', label: item.badge })
    } else {
      badges.push({ kind: 'new', label: item.badge })
    }
  }

  if (item.isNew) {
    badges.push({ kind: 'new', label: locale === 'ar' ? 'جديد' : 'New' })
  }

  if (item.isLimited || hasBundleLabel(item.name)) {
    badges.push({
      kind: hasBundleLabel(item.name) ? 'bundle' : 'bestseller',
      label: hasBundleLabel(item.name)
        ? (locale === 'ar' ? 'مجموعة' : 'Bundle')
        : (locale === 'ar' ? 'الأكثر مبيعاً' : 'Bestseller'),
    })
  }

  return badges.length > 0 ? badges : undefined
}

function inferInStock(stock: number | undefined, outOfStock?: boolean) {
  if (typeof outOfStock === 'boolean') {
    return !outOfStock
  }
  if (typeof stock === 'number') {
    return stock > 0
  }
  return true
}

function normalizeSlug(id: string, href: string) {
  const fromHref = href.split('/').filter(Boolean).at(-1)
  return fromHref || id
}

function buildPriceBlock(amount: number, currency: string, locale: 'en' | 'ar') {
  return {
    amount,
    currency,
    formatted: formatPrice(amount, currency, locale),
  }
}

function buildCompareAtBlock(amount: number | undefined, currency: string, locale: 'en' | 'ar') {
  if (typeof amount !== 'number') return undefined
  return {
    amount,
    formatted: formatPrice(amount, currency, locale),
  }
}

export function buildProductCardModel(product: Product, locale: 'en' | 'ar' = 'en'): ProductCardModel {
  const currency = product.currency || DEFAULT_CURRENCY
  const price = typeof product.price === 'number' ? product.price : 0
  const href = `/product/${product.id}`

  return {
    id: product.id,
    slug: normalizeSlug(product.id, href),
    href,
    title: product.name,
    brand: product.brand
      ? {
          name: product.brand,
        }
      : undefined,
    image: {
      url: product.image || FALLBACK_IMAGE,
      alt: product.name,
    },
    price: buildPriceBlock(price, currency, locale),
    compareAtPrice: buildCompareAtBlock(product.compareAtPrice, currency, locale),
    badges: buildBadgesFromProduct(product, price, locale),
    rating: typeof product.rating === 'number'
      ? {
          average: product.rating,
          count: product.reviews ?? 0,
        }
      : undefined,
    reviewCount: product.reviews,
    wishlistEnabled: true,
    isWishlisted: false,
    requiresVariantSelection: false,
    inStock: inferInStock(product.stock),
  }
}

export function buildProductCardModels(products: Product[], locale: 'en' | 'ar' = 'en') {
  return products.map((product) => buildProductCardModel(product, locale))
}

export function buildProductCardModelFromHomeItem(
  item: HomeProductItem,
  locale: 'en' | 'ar' = 'en',
): ProductCardModel {
  const currency = item.currency || DEFAULT_CURRENCY
  const href = item.href || `/product/${item.id}`

  return {
    id: item.id,
    slug: normalizeSlug(item.id, href),
    href,
    title: item.displayTitle || item.name,
    brand: item.brand
      ? {
          name: item.brand,
        }
      : undefined,
    image: {
      url: item.imageUrl || FALLBACK_IMAGE,
      alt: item.displayTitle || item.name,
    },
    price: buildPriceBlock(item.price, currency, locale),
    compareAtPrice: buildCompareAtBlock(item.compareAtPrice, currency, locale),
    badges: buildBadgesFromHomeItem(item, locale),
    rating: typeof item.rating === 'number'
      ? {
          average: item.rating,
          count: item.reviews ?? 0,
        }
      : undefined,
    reviewCount: item.reviews,
    wishlistEnabled: true,
    isWishlisted: false,
    requiresVariantSelection: Boolean(item.requiresVariantSelection),
    inStock: inferInStock(item.stock, item.outOfStock),
  }
}

export function buildProductCardModelsFromHomeItems(
  items: HomeProductItem[],
  locale: 'en' | 'ar' = 'en',
) {
  return items.map((item) => buildProductCardModelFromHomeItem(item, locale))
}

export function buildProductCardModelFromSearchSuggestion(
  suggestion: SearchSuggestion,
  locale: 'en' | 'ar' = 'en',
): ProductCardModel | null {
  if (suggestion.type !== 'product' || typeof suggestion.price !== 'number') {
    return null
  }

  const currency = DEFAULT_CURRENCY
  const title = suggestion.productName || suggestion.label
  const price = buildPriceBlock(suggestion.price, currency, locale)
  const compareAtPrice = buildCompareAtBlock(suggestion.compareAtPrice, currency, locale)
  const badges: ProductCardBadge[] = []

  appendUniqueBadge(badges, buildDiscountBadge(suggestion.price, suggestion.compareAtPrice))

  if (suggestion.discountLabel) {
    appendUniqueBadge(badges, {
      kind: 'discount',
      label: suggestion.discountLabel,
    })
  }

  return {
    id: suggestion.id.replace(/^p-/, ''),
    slug: normalizeSlug(suggestion.id, suggestion.href),
    href: suggestion.href,
    title,
    brand: suggestion.brandName
      ? {
          name: suggestion.brandName,
        }
      : undefined,
    image: {
      url: suggestion.imageUrl || FALLBACK_IMAGE,
      alt: title,
    },
    price,
    compareAtPrice,
    badges: badges.length > 0 ? badges : undefined,
    wishlistEnabled: true,
    isWishlisted: false,
    requiresVariantSelection: false,
    inStock: true,
  }
}

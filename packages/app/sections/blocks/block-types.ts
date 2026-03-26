import type { CMSPageBlock, LocalizedString, Product } from '@real/app/lib/types'
import type { HomeBrandItem, HomeProductItem } from '@real/ui/components/home/types'

export type RegisteredHomePageBlock = CMSPageBlock

export type HomeBlockRendererRailAutoplaySettings = {
  featured?: {
    enabled?: boolean
    autoplayMs?: number
  }
  brandSpotlights?: {
    enabled?: boolean
    autoplayMs?: number
  }
}

export type HomeBlockRendererProps = {
  block: RegisteredHomePageBlock
  isDesktop: boolean
  tickerSpeedMs: number
  loading: boolean
  error: string | null
  railAutoplay?: HomeBlockRendererRailAutoplaySettings
  locale?: 'en' | 'ar'
  onReload: () => void
  onNavigate?: (href: string) => void
  onSelectProduct?: (productId: string) => void
  onQuickView?: (item: HomeProductItem) => void
  onAddToCart?: (productId: string) => void
  onAddAllToCart?: (productIds: string[]) => void
}

export type HomeBlockRendererComponent = (props: HomeBlockRendererProps) => React.ReactNode

export function resolveBlockString(
  locale: 'en' | 'ar',
  value: string | LocalizedString | undefined,
  fallback = '',
) {
  if (!value) return fallback
  if (typeof value === 'string') return value
  const selected = value[locale]
  if (selected && selected.trim().length > 0) return selected
  return value[locale === 'ar' ? 'en' : 'ar'] || fallback
}

export function resolvePairString(
  locale: 'en' | 'ar',
  valueEn?: string,
  valueAr?: string,
  fallback = '',
) {
  if (locale === 'ar') return valueAr || valueEn || fallback
  return valueEn || valueAr || fallback
}

export function mapProductToHomeItem(product: Product): HomeProductItem {
  return {
    id: product.id,
    name: product.name,
    brand: product.brand ?? '',
    price: product.price,
    currency: product.currency,
    imageUrl: product.image,
    href: `/product/${product.id}`,
    rating: product.rating,
    reviews: product.reviews,
    isNew: product.isNew,
    isLimited: product.isLimited,
    stock: product.stock,
    displayTitle: product.name,
  }
}

export function mapProductsToHomeItems(products: Product[]) {
  return products.map(mapProductToHomeItem)
}

export function mapBrandItems(
  items: Array<{
    id: string
    name: string
    href?: string
    logoUrl?: string
  }>,
): HomeBrandItem[] {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    href: item.href,
    logoUrl: item.logoUrl,
  }))
}

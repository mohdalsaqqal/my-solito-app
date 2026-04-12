export type ProductCardBadgeKind = 'discount' | 'new' | 'bestseller' | 'bundle'

export type ProductCardBadge = {
  kind: ProductCardBadgeKind
  label: string
}

export type ProductCardModel = {
  id: string
  slug: string
  href: string
  title: string
  brand?: {
    id?: string
    name: string
  }
  image: {
    url: string
    alt?: string
  }
  price: {
    amount: number
    currency: string
    formatted: string
  }
  compareAtPrice?: {
    amount: number
    formatted: string
  }
  badges?: ProductCardBadge[]
  rating?: {
    average: number
    count: number
  }
  reviewCount?: number
  wishlistEnabled?: boolean
  isWishlisted?: boolean
  requiresVariantSelection: boolean
  inStock: boolean
}

export type ProductCardVariant = 'default' | 'compact' | 'featured' | 'cartable'

export type ProductCardProps = {
  item: ProductCardModel
  variant?: ProductCardVariant
  disabled?: boolean
  width?: number
  showWishlist?: boolean
  showBrand?: boolean
  showRating?: boolean
  showQuickAdd?: boolean
  onPress?: () => void
  onPressWishlist?: () => void
  onPressAdd?: () => void
  testID?: string
}

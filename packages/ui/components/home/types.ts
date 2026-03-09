export type HomeHeroItem = {
  id: string
  title: string
  subtitle?: string
  ctaLabel?: string
  href?: string
  imageUrl?: string
  badgeLabel?: string
}

export type HomeCategoryItem = {
  id: string
  label: string
  href?: string
}

export type HomeProductItem = {
  id: string
  name: string
  brand: string
  price: number
  compareAtPrice?: number
  imageUrl?: string
  href?: string
  badge?: string
  urgencyLabel?: string
  rating?: number
  reviews?: number
  isNew?: boolean
  isLimited?: boolean
  stock?: number
}

export type HomeCampaignItem = {
  id: string
  title: string
  subtitle?: string
  ctaLabel?: string
  href?: string
  imageUrl?: string
}

export type HomeBrandItem = {
  id: string
  name: string
  href?: string
  logoUrl?: string
}

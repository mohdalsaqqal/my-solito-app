export type HomeHeroItem = {
  id: string
  title: string
  subtitle?: string
  ctaLabel?: string
  href?: string
  imageUrl?: string
  badgeLabel?: string
  panelColor?: string
}

export type HomeCategoryItem = {
  id: string
  label: string
  href?: string
  itemCount?: number
  imageUrl?: string
}

export type HomeProductItem = {
  id: string
  name: string
  brand: string
  price: number
  currency?: string
  compareAtPrice?: number
  imageUrl?: string
  imageAlt?: string
  hoverImageUrl?: string
  href?: string
  badge?: string
  urgencyLabel?: string
  displayTitle?: string
  displaySubtitle?: string
  description?: string
  attributesList?: string[]
  pricePerUnitLabel?: string
  rating?: number
  reviews?: number
  isNew?: boolean
  isLimited?: boolean
  stock?: number
  outOfStock?: boolean
  swatches?: Array<{
    id: string
    hex: string
    label?: string
    imageUrl?: string
  }>
  requiresVariantSelection?: boolean
}

export type HomeEditorialHotspotItem = {
  id: string
  productId: string
  xPercent: number
  yPercent: number
  label?: string
}

export type HomeEditorialHotspotSection = {
  id: string
  title?: string
  subtitle?: string
  ctaLabel?: string
  href?: string
  imageUrl: string
  hotspots?: HomeEditorialHotspotItem[]
  products: HomeProductItem[]
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

export type HomeUgcItem = {
  id: string
  imageUrl: string
  productId?: string
  caption?: string
  href?: string
}

export type HomeEducationBanner = {
  id: string
  title: string
  subtitle?: string
  ctaLabel?: string
  href?: string
  imageUrl?: string
}

export type HomeNewsletterCta = {
  title: string
  subtitle?: string
  ctaLabel?: string
  href?: string
}

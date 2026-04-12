import { z } from 'zod'
import { LocalizedString, Product } from '../types'

// ─── Existing block TypeScript types ────────────────────────────────────────

export type HeroBlock = {
  id: string
  type: 'hero'
  title: LocalizedString
  subtitle?: LocalizedString
  ctaLabel?: LocalizedString
  imageUrl?: string
  href?: string
}

export type ProductSliderBlock = {
  id: string
  type: 'product_slider'
  title: LocalizedString
  subtitle?: LocalizedString
  querySlug: string
  products?: Product[]
}

export type BrandPromoBlock = {
  id: string
  type: 'brand_promo'
  title: LocalizedString
  subtitle?: LocalizedString
  ctaLabel?: LocalizedString
  imageUrl?: string
  href?: string
  querySlug?: string
  products?: Product[]
}

export type PromoStripBlock = {
  id: string
  type: 'promo_strip'
  text: LocalizedString
  ctaLabel?: LocalizedString
  href?: string
}

export type CategoryShortcutsBlock = {
  id: string
  type: 'category_shortcuts'
  title?: LocalizedString
  items: Array<{
    id: string
    label: LocalizedString
    href?: string
    imageUrl?: string
  }>
}

export type OfferStackBlock = {
  id: string
  type: 'offer_stack'
  items: Array<{
    id: string
    badge?: LocalizedString
    title: LocalizedString
    subtitle?: LocalizedString
    href?: string
  }>
}

export type StickyListingPromoBlock = {
  id: string
  type: 'sticky_listing_promo'
  badge?: LocalizedString
  title: LocalizedString
  subtitle?: LocalizedString
  href?: string
}

// ─── New block TypeScript types ──────────────────────────────────────────────

export type HeroCarouselCard = {
  id: string
  titleEn: string
  titleAr: string
  subtitleEn?: string
  subtitleAr?: string
  imageUrl: string
  ctaLabelEn?: string
  ctaLabelAr?: string
  href?: string
  badgeLabelEn?: string
  badgeLabelAr?: string
}

export type HeroCarouselBlock = {
  id: string
  type: 'hero_carousel'
  autoplayMs: number
  cards: HeroCarouselCard[]
}

export type FlashSaleBlock = {
  id: string
  type: 'flash_sale'
  titleEn: string
  titleAr: string
  timerEndsAt: string
  urgencyLabelEn?: string
  urgencyLabelAr?: string
  ctaLabelEn?: string
  ctaLabelAr?: string
  href?: string
  imageUrl?: string
}

export type BrandSpotlightBlock = {
  id: string
  type: 'brand_spotlight'
  bannerTitleEn?: string
  bannerTitleAr?: string
  bannerSubtitleEn?: string
  bannerSubtitleAr?: string
  bannerImageUrl: string
  bannerCtaLabelEn?: string
  bannerCtaLabelAr?: string
  bannerHref?: string
  railTitleEn?: string
  railTitleAr?: string
  querySlug?: string
  products?: Product[]
}

export type OfferBannerItem = {
  id: string
  imageUrl: string
  href?: string
  ctaLabelEn?: string
  ctaLabelAr?: string
}

export type OfferBannersBlock = {
  id: string
  type: 'offer_banners'
  items: OfferBannerItem[]
}

export type EducationBannerBlock = {
  id: string
  type: 'education_banner'
  titleEn: string
  titleAr: string
  bodyEn?: string
  bodyAr?: string
  ctaLabelEn?: string
  ctaLabelAr?: string
  href?: string
  imageUrl?: string
}

export type NewsletterCtaBlock = {
  id: string
  type: 'newsletter_cta'
  titleEn: string
  titleAr: string
  subtitleEn?: string
  subtitleAr?: string
  ctaLabelEn?: string
  ctaLabelAr?: string
  href?: string
}

export type TopBrandItem = {
  id: string
  name: string
  logoUrl?: string
  href?: string
}

export type TopBrandsBlock = {
  id: string
  type: 'top_brands'
  titleEn?: string
  titleAr?: string
  items: TopBrandItem[]
}

export type UgcGalleryBlock = {
  id: string
  type: 'ugc_gallery'
  titleEn?: string
  titleAr?: string
}

export type PersonalizedRailBlock = {
  id: string
  type: 'personalized_rail'
  titleEn: string
  titleAr: string
  mode: 'static' | 'rule-based'
  querySlug?: string
  products?: Product[]
}

export type EditorialHotspotBlock = {
  id: string
  type: 'editorial_hotspot'
  title?: LocalizedString
  subtitle?: LocalizedString
  ctaLabel?: LocalizedString
  href?: string
  imageUrl: string
  productIds: string[]
  hotspots?: Array<{
    id: string
    productId: string
    xPercent: number
    yPercent: number
    label?: LocalizedString
  }>
}

export type PdpOfferClusterBlock = {
  id: string
  type: 'pdp_offer_cluster'
  badge?: LocalizedString
  title: LocalizedString
  subtitle?: LocalizedString
}

export type CartUpsellRailBlock = {
  id: string
  type: 'cart_upsell_rail'
  title: LocalizedString
  querySlug: string
  products?: Product[]
}

export type BrandDealBannerItem = {
  id: string
  brandNameEn: string
  brandNameAr: string
  preLabelEn?: string
  preLabelAr?: string
  discountLabelEn: string
  discountLabelAr: string
  backgroundColor?: string
  imageUrl?: string
  href?: string
}

export type BrandDealBannerBlock = {
  id: string
  type: 'brand_deal_banner'
  titleEn?: string
  titleAr?: string
  items: BrandDealBannerItem[]
}

// ─── Union types ─────────────────────────────────────────────────────────────

export type HomeBlock =
  | HeroBlock
  | ProductSliderBlock
  | BrandPromoBlock
  | PromoStripBlock
  | CategoryShortcutsBlock
  | OfferStackBlock
  | StickyListingPromoBlock
  | HeroCarouselBlock
  | FlashSaleBlock
  | BrandSpotlightBlock
  | OfferBannersBlock
  | EducationBannerBlock
  | NewsletterCtaBlock
  | TopBrandsBlock
  | UgcGalleryBlock
  | PersonalizedRailBlock
  | EditorialHotspotBlock
  | PdpOfferClusterBlock
  | CartUpsellRailBlock
  | BrandDealBannerBlock

export type BlockType = HomeBlock['type']

// ─── Shared Zod helpers ───────────────────────────────────────────────────────

const localizedStringSchema = z
  .object({
    en: z.string().default(''),
    ar: z.string().default(''),
  })
  .strict()

/** Validates href as either an absolute URL, relative path, or protocol-relative URL. */
const hrefSchema = z.string().optional().refine(
  (v) => v === undefined || v === '' || v.startsWith('/') || v.startsWith('#') || v.startsWith('http://') || v.startsWith('https://') || v.startsWith('mailto:') || v.startsWith('tel:'),
  { message: 'href must be a valid URL or relative path' },
).refine(
  (v) => !v || !(v.toLowerCase().startsWith('javascript:') || v.toLowerCase().startsWith('data:') || v.toLowerCase().startsWith('vbscript:')),
  { message: 'href must not contain dangerous schemes' },
)

// ─── Existing block Zod schemas ───────────────────────────────────────────────

const heroBlockSchema = z
  .object({
    id: z.string().min(1),
    type: z.literal('hero'),
    title: localizedStringSchema,
    subtitle: localizedStringSchema.optional(),
    ctaLabel: localizedStringSchema.optional(),
    imageUrl: z.string().url().optional(),
    href: hrefSchema,
  })
  .strict()

const sliderBlockSchema = z
  .object({
    id: z.string().min(1),
    type: z.literal('product_slider'),
    title: localizedStringSchema,
    subtitle: localizedStringSchema.optional(),
    querySlug: z.string().min(1),
  })
  .strict()

const brandPromoBlockSchema = z
  .object({
    id: z.string().min(1),
    type: z.literal('brand_promo'),
    title: localizedStringSchema,
    subtitle: localizedStringSchema.optional(),
    ctaLabel: localizedStringSchema.optional(),
    imageUrl: z.string().url().optional(),
    href: hrefSchema,
    querySlug: z.string().min(1).optional(),
  })
  .strict()

const promoStripBlockSchema = z
  .object({
    id: z.string().min(1),
    type: z.literal('promo_strip'),
    text: localizedStringSchema,
    ctaLabel: localizedStringSchema.optional(),
    href: hrefSchema,
  })
  .strict()

const categoryShortcutsBlockSchema = z
  .object({
    id: z.string().min(1),
    type: z.literal('category_shortcuts'),
    title: localizedStringSchema.optional(),
    items: z.array(z.object({
      id: z.string().min(1),
      label: localizedStringSchema,
      href: hrefSchema,
      imageUrl: z.string().optional(),
    })).min(1),
  })
  .strict()

const offerStackBlockSchema = z
  .object({
    id: z.string().min(1),
    type: z.literal('offer_stack'),
    items: z.array(z.object({
      id: z.string().min(1),
      badge: localizedStringSchema.optional(),
      title: localizedStringSchema,
      subtitle: localizedStringSchema.optional(),
      href: hrefSchema,
    })).min(1),
  })
  .strict()

const stickyListingPromoBlockSchema = z
  .object({
    id: z.string().min(1),
    type: z.literal('sticky_listing_promo'),
    badge: localizedStringSchema.optional(),
    title: localizedStringSchema,
    subtitle: localizedStringSchema.optional(),
    href: hrefSchema,
  })
  .strict()

// ─── New block Zod schemas ────────────────────────────────────────────────────

const heroCarouselCardSchema = z.object({
  id: z.string().min(1),
  titleEn: z.string().min(1),
  titleAr: z.string().min(1),
  subtitleEn: z.string().optional(),
  subtitleAr: z.string().optional(),
  imageUrl: z.string().min(1),
  ctaLabelEn: z.string().optional(),
  ctaLabelAr: z.string().optional(),
  href: hrefSchema,
  badgeLabelEn: z.string().optional(),
  badgeLabelAr: z.string().optional(),
})

const heroCarouselBlockSchema = z
  .object({
    id: z.string().min(1),
    type: z.literal('hero_carousel'),
    autoplayMs: z.number().int().positive().default(4000),
    cards: z.array(heroCarouselCardSchema).min(1),
  })
  .strict()

const flashSaleBlockSchema = z
  .object({
    id: z.string().min(1),
    type: z.literal('flash_sale'),
    titleEn: z.string().min(1),
    titleAr: z.string().min(1),
    timerEndsAt: z.string().refine((v) => !Number.isNaN(Date.parse(v)), { message: 'timerEndsAt must be a valid date string' }),
    urgencyLabelEn: z.string().optional(),
    urgencyLabelAr: z.string().optional(),
    ctaLabelEn: z.string().optional(),
    ctaLabelAr: z.string().optional(),
    href: hrefSchema,
    imageUrl: z.string().optional(),
  })
  .strict()

const brandSpotlightBlockSchema = z
  .object({
    id: z.string().min(1),
    type: z.literal('brand_spotlight'),
    bannerTitleEn: z.string().optional(),
    bannerTitleAr: z.string().optional(),
    bannerSubtitleEn: z.string().optional(),
    bannerSubtitleAr: z.string().optional(),
    bannerImageUrl: z.string().min(1),
    bannerCtaLabelEn: z.string().optional(),
    bannerCtaLabelAr: z.string().optional(),
    bannerHref: z.string().optional(),
    railTitleEn: z.string().optional(),
    railTitleAr: z.string().optional(),
    querySlug: z.string().optional(),
  })
  .strict()

const offerBannerItemSchema = z.object({
  id: z.string().min(1),
  imageUrl: z.string().min(1),
  href: hrefSchema,
  ctaLabelEn: z.string().optional(),
  ctaLabelAr: z.string().optional(),
})

const offerBannersBlockSchema = z
  .object({
    id: z.string().min(1),
    type: z.literal('offer_banners'),
    items: z.array(offerBannerItemSchema).min(1).max(4),
  })
  .strict()

const educationBannerBlockSchema = z
  .object({
    id: z.string().min(1),
    type: z.literal('education_banner'),
    titleEn: z.string().min(1),
    titleAr: z.string().min(1),
    bodyEn: z.string().optional(),
    bodyAr: z.string().optional(),
    ctaLabelEn: z.string().optional(),
    ctaLabelAr: z.string().optional(),
    href: hrefSchema,
    imageUrl: z.string().optional(),
  })
  .strict()

const newsletterCtaBlockSchema = z
  .object({
    id: z.string().min(1),
    type: z.literal('newsletter_cta'),
    titleEn: z.string().min(1),
    titleAr: z.string().min(1),
    subtitleEn: z.string().optional(),
    subtitleAr: z.string().optional(),
    ctaLabelEn: z.string().optional(),
    ctaLabelAr: z.string().optional(),
    href: hrefSchema,
  })
  .strict()

const topBrandItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  logoUrl: z.string().optional(),
  href: hrefSchema,
})

const topBrandsBlockSchema = z
  .object({
    id: z.string().min(1),
    type: z.literal('top_brands'),
    titleEn: z.string().optional(),
    titleAr: z.string().optional(),
    items: z.array(topBrandItemSchema).min(1),
  })
  .strict()

const ugcGalleryBlockSchema = z
  .object({
    id: z.string().min(1),
    type: z.literal('ugc_gallery'),
    titleEn: z.string().optional(),
    titleAr: z.string().optional(),
  })
  .strict()

const personalizedRailBlockSchema = z
  .object({
    id: z.string().min(1),
    type: z.literal('personalized_rail'),
    titleEn: z.string().min(1),
    titleAr: z.string().min(1),
    mode: z.enum(['static', 'rule-based']),
    querySlug: z.string().optional(),
  })
  .strict()

const editorialHotspotBlockSchema = z
  .object({
    id: z.string().min(1),
    type: z.literal('editorial_hotspot'),
    title: localizedStringSchema.optional(),
    subtitle: localizedStringSchema.optional(),
    ctaLabel: localizedStringSchema.optional(),
    href: hrefSchema,
    imageUrl: z.string().min(1),
    productIds: z.array(z.string().min(1)).min(1).max(4),
    hotspots: z
      .array(
        z
          .object({
            id: z.string().min(1),
            productId: z.string().min(1),
            xPercent: z.number().min(0).max(100),
            yPercent: z.number().min(0).max(100),
            label: localizedStringSchema.optional(),
          })
          .strict(),
      )
      .optional(),
  })
  .strict()

const pdpOfferClusterBlockSchema = z
  .object({
    id: z.string().min(1),
    type: z.literal('pdp_offer_cluster'),
    badge: localizedStringSchema.optional(),
    title: localizedStringSchema,
    subtitle: localizedStringSchema.optional(),
  })
  .strict()

const cartUpsellRailBlockSchema = z
  .object({
    id: z.string().min(1),
    type: z.literal('cart_upsell_rail'),
    title: localizedStringSchema,
    querySlug: z.string().min(1),
  })
  .strict()

const brandDealBannerItemSchema = z.object({
  id: z.string().min(1),
  brandNameEn: z.string().min(1),
  brandNameAr: z.string().min(1),
  preLabelEn: z.string().optional(),
  preLabelAr: z.string().optional(),
  discountLabelEn: z.string().min(1),
  discountLabelAr: z.string().min(1),
  backgroundColor: z.string().optional().refine(
    (v) => !v || /^#?[0-9a-fA-F]{3,8}$|^rgb|^hsl|^var\(|^transparent$|^inherit$|^unset$/i.test(v),
    { message: 'backgroundColor must be a valid CSS color' },
  ),
  imageUrl: z.string().url().optional(),
  href: hrefSchema,
})

const brandDealBannerBlockSchema = z
  .object({
    id: z.string().min(1),
    type: z.literal('brand_deal_banner'),
    titleEn: z.string().optional(),
    titleAr: z.string().optional(),
    items: z.array(brandDealBannerItemSchema).min(1),
  })
  .strict()

// ─── Combined discriminated union ─────────────────────────────────────────────

export const homeBlockSchema = z.discriminatedUnion('type', [
  heroBlockSchema,
  sliderBlockSchema,
  brandPromoBlockSchema,
  promoStripBlockSchema,
  categoryShortcutsBlockSchema,
  offerStackBlockSchema,
  stickyListingPromoBlockSchema,
  heroCarouselBlockSchema,
  flashSaleBlockSchema,
  brandSpotlightBlockSchema,
  offerBannersBlockSchema,
  educationBannerBlockSchema,
  newsletterCtaBlockSchema,
  topBrandsBlockSchema,
  ugcGalleryBlockSchema,
  personalizedRailBlockSchema,
  editorialHotspotBlockSchema,
  pdpOfferClusterBlockSchema,
  cartUpsellRailBlockSchema,
  brandDealBannerBlockSchema,
])

export function parseHomeBlock(value: unknown): HomeBlock | null {
  const parsed = homeBlockSchema.safeParse(value)
  if (!parsed.success) return null
  return parsed.data
}

export function localizeString(value: LocalizedString | undefined, locale: 'en' | 'ar', fallback = '') {
  if (!value) return fallback
  const selected = value[locale]
  if (selected && selected.trim().length > 0) return selected
  const fallbackLocale = locale === 'en' ? 'ar' : 'en'
  return value[fallbackLocale] || fallback
}

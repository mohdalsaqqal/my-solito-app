import type {
  BrandPromoBlock,
  BrandSpotlightBlock,
  CartUpsellRailBlock,
  CategoryShortcutsBlock,
  EducationBannerBlock,
  EditorialHotspotBlock,
  FlashSaleBlock,
  HeroBlock,
  HeroCarouselBlock,
  HomeBlock,
  NewsletterCtaBlock,
  OfferBannersBlock,
  OfferStackBlock,
  PdpOfferClusterBlock,
  PersonalizedRailBlock,
  ProductSliderBlock,
  PromoStripBlock,
  StickyListingPromoBlock,
  TopBrandsBlock,
  UgcGalleryBlock,
} from '../cms/blocks'

export const PAGE_BLOCK_CONTRACT_VERSION = 'v1' as const
export const HOME_PAGE_TYPE = 'home' as const
export const HOME_PAGE_SLUG = '/' as const
export const SEARCH_PAGE_TYPE = 'search' as const
export const SEARCH_PAGE_SLUG = '/search' as const
export const DEFAULT_PAGE_BLOCK_SCOPE = {
  storeId: 'default',
  slug: HOME_PAGE_SLUG,
  pageType: HOME_PAGE_TYPE,
} as const

export type PageBlockContractVersion = typeof PAGE_BLOCK_CONTRACT_VERSION
export type PageType = typeof HOME_PAGE_TYPE | typeof SEARCH_PAGE_TYPE
export type PageSlug = typeof HOME_PAGE_SLUG | typeof SEARCH_PAGE_SLUG | string
export type AdminPageBlockScope = {
  storeId: string
  slug: PageSlug
  pageType: PageType | string
}

export type PageBlock<
  TType extends string = string,
  TProps extends Record<string, unknown> = Record<string, unknown>,
> = {
  id: string
  type: TType
  version: PageBlockContractVersion
  position: number
  props: TProps
}

export type PagePayload<
  TType extends string = string,
  TProps extends Record<string, unknown> = Record<string, unknown>,
> = {
  storeId: string
  slug: PageSlug
  pageType: PageType | string
  blocks: Array<PageBlock<TType, TProps>>
}

export type SupportedPageBlockType = HomeBlock['type']

export type QueryBoundBlockType = Extract<
  SupportedPageBlockType,
  'product_slider' | 'brand_promo' | 'brand_spotlight' | 'personalized_rail' | 'cart_upsell_rail'
>

export type SupportedPageBlockPropsByType = {
  hero: HeroBlock
  product_slider: ProductSliderBlock
  brand_promo: BrandPromoBlock
  promo_strip: PromoStripBlock
  category_shortcuts: CategoryShortcutsBlock
  offer_stack: OfferStackBlock
  sticky_listing_promo: StickyListingPromoBlock
  hero_carousel: HeroCarouselBlock
  flash_sale: FlashSaleBlock
  brand_spotlight: BrandSpotlightBlock
  offer_banners: OfferBannersBlock
  education_banner: EducationBannerBlock
  newsletter_cta: NewsletterCtaBlock
  top_brands: TopBrandsBlock
  ugc_gallery: UgcGalleryBlock
  personalized_rail: PersonalizedRailBlock
  editorial_hotspot: EditorialHotspotBlock
  pdp_offer_cluster: PdpOfferClusterBlock
  cart_upsell_rail: CartUpsellRailBlock
}

export type SupportedPageBlock = {
  [TType in keyof SupportedPageBlockPropsByType]: PageBlock<
    TType,
    SupportedPageBlockPropsByType[TType]
  >
}[keyof SupportedPageBlockPropsByType]

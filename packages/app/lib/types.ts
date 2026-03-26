import type { HomeBlock, HeroCarouselCard, OfferBannerItem } from './cms/blocks'
import type { PageBlockContractVersion, PagePayload } from './layout/page-types'

export type Product = {
  id: string
  name: string
  description?: string
  price: number
  currency: string
  image?: string
  rating?: number
  reviews?: number
  isNew?: boolean
  isLimited?: boolean
  stock?: number
  brand?: string
  category?: string
  manualRelatedIds?: string[]
  crossSellIds?: string[]
  completeSetIds?: string[]
  attributes?: Record<string, unknown>
  sourceMeta?: {
    system: string
    table?: string
    schemaVersion: string
    externalId?: string
    syncedAt?: string
    mappedColumns?: string[]
  }
}

export type AdminColumnType =
  | 'string'
  | 'number'
  | 'money'
  | 'date'
  | 'status'
  | 'image'
  | 'boolean'
  | 'badge'

export type AdminColumnDefinition = {
  key: string
  label: string
  type: AdminColumnType
  sortable?: boolean
  filterable?: boolean
  source: 'core' | 'computed' | 'custom'
}

export type AdminFieldRegistry = {
  coreFields: AdminColumnDefinition[]
  computedFields: AdminColumnDefinition[]
  customFields: AdminColumnDefinition[]
}

export type AdminPageInfo = {
  hasNextPage: boolean
  hasPreviousPage: boolean
  startCursor?: string
  endCursor?: string
}

export type AdminPagedResponse<T> = {
  nodes: T[]
  pageInfo: AdminPageInfo
}

export type ProductRow = {
  id: string
  title: string
  brand?: string
  category?: string
  price?: number
  comparePrice?: number
  inventory?: number
  status?: string
  sku?: string
  image?: string
  vendor?: string
  updatedAt?: string
  customFields?: Record<string, unknown>
}

export type OrderRow = {
  id: string
  orderNumber: string
  customerName?: string
  customerEmail?: string
  total?: number
  currency?: string
  paymentStatus?: string
  fulfillmentStatus?: string
  orderStatus?: string
  vendor?: string
  itemCount?: number
  createdAt?: string
  updatedAt?: string
  customFields?: Record<string, unknown>
}

export type InventoryRow = {
  id: string
  sku?: string
  title?: string
  variantTitle?: string
  warehouse?: string
  available?: number
  reserved?: number
  incoming?: number
  lowStockThreshold?: number
  stockStatus?: string
  vendor?: string
  updatedAt?: string
  customFields?: Record<string, unknown>
}

export type VendorRow = {
  id: string
  name: string
  email?: string
  phone?: string
  status?: string
  commissionRate?: number
  productCount?: number
  orderCount?: number
  payoutStatus?: string
  createdAt?: string
  updatedAt?: string
  customFields?: Record<string, unknown>
}

export type AdminSavedView = {
  id: string
  entity: 'products' | 'orders' | 'inventory' | 'vendors'
  name: string
  filters?: Record<string, unknown>
  sort?: {
    key: string
    direction: 'asc' | 'desc'
  }
  visibleColumns: string[]
}

export type AdminJobEntity = AdminSavedView['entity'] | 'system'

export type AdminJobType =
  | 'export'
  | 'import'
  | 'bulk-update'
  | 'stock-adjust'
  | 'transfer'
  | 'vendor-approval-batch'
  | 'payout-run'

export type AdminJobStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled'

export type AdminJobRecord = {
  id: string
  type: AdminJobType
  entity: AdminJobEntity
  status: AdminJobStatus
  createdAt: string
  updatedAt: string
  summary: string
  requestedBy: {
    userId: string
    email: string
  }
  targetIds: string[]
  input?: Record<string, unknown>
  result?: Record<string, unknown>
}

export type AdminJobCreateInput = {
  type: AdminJobType
  entity: AdminJobEntity
  summary: string
  targetIds?: string[]
  input?: Record<string, unknown>
}

export type AdminListInput = {
  limit: number
  cursor?: string
  search?: string
  filters?: Record<string, unknown>
  sort?: {
    key: string
    direction: 'asc' | 'desc'
  }
  fields?: string[]
  viewId?: string
}

export type CommerceCapabilities = {
  products: {
    bulkEdit: boolean
    variantImages: boolean
    advancedVariants: boolean
  }
  orders: {
    refunds: boolean
    exchanges: boolean
    splitShipments: boolean
  }
  inventory: {
    multiWarehouse: boolean
    reservations: boolean
    transfers: boolean
  }
  vendors: {
    marketplace: boolean
    approvals: boolean
    commissions: boolean
    payouts: boolean
  }
}

export type ProductDetail = ProductRow & {
  description?: string
  currency?: string
  sales?: number
  variantCount?: number
  sourceColumns?: string[]
  createdAt?: string
}

export type ProductUpsertInput = {
  title: string
  brand?: string
  category?: string
  price?: number
  comparePrice?: number
  inventory?: number
  status?: string
  sku?: string
  image?: string
  vendor?: string
  description?: string
  currency?: string
  sales?: number
  variantCount?: number
  customFields?: Record<string, unknown>
}

export type ProductActionInput = {
  action: 'activate' | 'deactivate' | 'archive' | 'assign-category' | 'assign-vendor'
  input?: Record<string, unknown>
}

export type OrderDetail = OrderRow & {
  notes?: string
  tags?: string[]
  shippingAddress?: string
  billingAddress?: string
  lineItems?: Array<{
    id: string
    sku?: string
    title: string
    quantity: number
    price: number
  }>
}

export type OrderUpdateInput = {
  paymentStatus?: string
  fulfillmentStatus?: string
  orderStatus?: string
  vendor?: string
  notes?: string
  tags?: string[]
  customFields?: Record<string, unknown>
}

export type OrderActionInput = {
  action: 'mark-review' | 'assign-tag' | 'refund' | 'exchange' | 'split-shipment'
  input?: Record<string, unknown>
}

export type InventoryDetail = InventoryRow & {
  locationNotes?: string
  lastAdjustmentAt?: string
  transferHistory?: Array<{
    id: string
    fromWarehouse: string
    toWarehouse: string
    quantity: number
    createdAt: string
  }>
}

export type InventoryUpdateInput = {
  warehouse?: string
  lowStockThreshold?: number
  vendor?: string
  locationNotes?: string
  customFields?: Record<string, unknown>
}

export type InventoryActionInput = {
  action: 'adjust' | 'transfer' | 'assign-warehouse'
  input?: Record<string, unknown>
}

export type VendorDetail = VendorRow & {
  notes?: string
  approvalStatus?: 'approved' | 'pending' | 'rejected'
  productIds?: string[]
}

export type VendorUpdateInput = {
  name?: string
  email?: string
  phone?: string
  status?: string
  commissionRate?: number
  payoutStatus?: string
  notes?: string
  customFields?: Record<string, unknown>
}

export type VendorActionInput = {
  action: 'approve' | 'reject' | 'change-status'
  input?: Record<string, unknown>
}

export type Cart = {
  items: Array<{ productId: string; quantity: number }>
  updatedAt: string
}

export type LocalizedString = {
  en: string
  ar: string
}

export type ProductFilter = {
  brand?: string[]
  category?: string[]
  ids?: string[]
  onSale?: boolean
  sort?: 'newest' | 'bestseller' | 'price_asc' | 'price_desc'
  limit?: number
}

export type ProductQuery = {
  slug: string
  filters: ProductFilter
  active: boolean
  title?: LocalizedString
}

export type TranslationNamespaceStatus = {
  namespace: string
  totalKeys: number
  missingKeys: number
}

export type TranslationLocaleStatus = {
  locale: 'en' | 'ar'
  totalKeys: number
  missingKeys: number
  namespaces: TranslationNamespaceStatus[]
}

export type TranslationStatus = {
  provider: 'crowdin'
  connected: boolean
  checkedAt: string
  locales: TranslationLocaleStatus[]
}

export type TranslationPrefillResult = {
  provider: 'crowdin'
  runAt: string
  sourceLocale: 'en' | 'ar'
  targetLocale: 'en' | 'ar'
  filledKeys: number
  missingBefore: number
  missingAfter: number
  dryRun: boolean
}

export type ReleaseEnvironment = 'staging' | 'production'
export type ReleaseStatus = 'draft' | 'published'
export type ReleaseBlockType =
  | 'hero'
  | 'product_slider'
  | 'brand_promo'
  | 'promo_strip'
  | 'category_shortcuts'
  | 'offer_stack'
  | 'sticky_listing_promo'
  | 'hero_carousel'
  | 'flash_sale'
  | 'brand_spotlight'
  | 'offer_banners'
  | 'education_banner'
  | 'newsletter_cta'
  | 'top_brands'
  | 'ugc_gallery'
  | 'personalized_rail'
  | 'editorial_hotspot'
  | 'pdp_offer_cluster'
  | 'cart_upsell_rail'

export type AdminReleaseRecord = {
  id: string
  name?: string
  environment: ReleaseEnvironment
  status: ReleaseStatus
  scheduledAt?: string
  createdAt: string
  updatedAt: string
}

export type AdminReleaseBlockRecord = {
  id: string
  releaseId: string
  position: number
  type: ReleaseBlockType
  payloadJson: unknown
  enabled: boolean
}

export type AdminPageBlockRecord = AdminReleaseBlockRecord & {
  pageConfigId?: string
  storeId: string
  slug: string
  pageType: string
  version: PageBlockContractVersion
}

export type PromotionCondition =
  | { type: 'min_cart_total'; amount: number }
  | { type: 'brand_in'; brands: string[] }
  | { type: 'coupon_required'; code?: string }

export type PromotionReward =
  | { type: 'percent_off'; value: number }
  | { type: 'fixed_amount_off'; value: number }
  | { type: 'free_shipping'; value: true }

export type Promotion = {
  id: string
  code?: string
  name: LocalizedString
  isActive: boolean
  startAt: string
  endAt: string
  priority: number
  conditions: PromotionCondition[]
  rewards: PromotionReward[]
}

export type AppliedPromotion = {
  id: string
  code?: string
  name: string
  rewardType: 'percent_off' | 'fixed_amount_off' | 'free_shipping'
  discountAmount: number
  shippingDiscountAmount: number
}

export type QuoteTotals = {
  baseSubtotal: number
  subtotal: number
  discountTotal: number
  discount: number
  shipping: number
  finalTotal: number
  total: number
  currency: string
  appliedPromotion?: AppliedPromotion
}

export type CheckoutQuoteInput = {
  items?: Array<{
    productId: string
    quantity: number
  }>
  fulfillment: {
    mode: 'delivery' | 'pickup'
    branchId?: string
  }
  couponCode?: string
}

export type CheckoutQuoteResponse = {
  quoteId: string
  expiresAt: string
  totals: QuoteTotals
}

export type LogoSizeKey = 'sm' | 'md' | 'lg'

export type CMSLocale = 'en' | 'ar'

export type CMSHomeHeroCarouselCard = HeroCarouselCard & {
  titleText: string
  subtitleText?: string
  ctaText?: string
  badgeText?: string
}

export type CMSHomeOfferBannerItem = OfferBannerItem & {
  ctaText?: string
}

export type CMSHomeBlock = HomeBlock & {
  position: number
  releaseId: string
  locale: CMSLocale
  titleText?: string
  subtitleText?: string
  ctaText?: string
  textValue?: string
  cardsLocalized?: CMSHomeHeroCarouselCard[]
  itemsLocalized?: CMSHomeOfferBannerItem[]
  products?: Product[]
  hotspots?: Array<{
    id: string
    productId: string
    xPercent: number
    yPercent: number
    label?: LocalizedString
  }>
  items?: Array<{
    id: string
    imageUrl: string
    caption?: LocalizedString
    href?: string
    productId?: string
  }>
}

export type CMSPageBlock = PagePayload<string, CMSHomeBlock>['blocks'][number]

export type MarketingCampaignZone =
  | 'home_hero_primary'
  | 'home_flash_sale'
  | 'home_inline_banner'
  | 'shop_banner'
  | 'shop_flash_sale'

export type MarketingCampaign = {
  id: string
  enabled?: boolean
  zone?: MarketingCampaignZone
  title: LocalizedString
  subtitle?: LocalizedString
  ctaLabel?: LocalizedString
  href?: string
  imageUrl?: string
  timerEndsAt?: string
  urgencyBadge?: LocalizedString
  showTimer?: boolean
  showUrgency?: boolean
}

export type CMSHome = {
  storeId: string
  page?: PagePayload<string, CMSHomeBlock>
  heroSlides: Array<{
    id: string
    title: string
    subtitle?: string
    ctaLabel?: string
  }>
  shell?: {
    topBar?: {
      message: LocalizedString
      secondaryMessage?: LocalizedString
      ctaLabel?: LocalizedString
      ctaHref?: string
    }
    branding?: {
      logo: {
        uri: string
        alt: LocalizedString
      }
      logoSize?: LogoSizeKey
    }
    navigation?: {
      categories?: Array<{
        id: string
        label: LocalizedString
        href: string
        group?: string
        description?: LocalizedString
      }>
    }
    footer?: {
      newsletterTitle?: LocalizedString
      newsletterSubtitle?: LocalizedString
      legalNotice?: LocalizedString
      socialLabels?: Array<{
        id: string
        label: LocalizedString
      }>
    }
    search?: {
      panelTitles?: {
        trendingSearches?: LocalizedString
        popularBrands?: LocalizedString
        recentSearches?: LocalizedString
        suggestions?: LocalizedString
        products?: LocalizedString
      }
      panelMessages?: {
        loadingSuggestions?: LocalizedString
        unavailableSuggestions?: LocalizedString
        noMatchingSuggestions?: LocalizedString
        noProductSuggestions?: LocalizedString
        noPopularBrands?: LocalizedString
        noRecentSearches?: LocalizedString
      }
      clearRecentLabel?: LocalizedString
    }
  }
  marketing?: {
    railAutoplay?: {
      hero?: {
        enabled?: boolean
        autoplayMs?: number
      }
      categories?: {
        enabled?: boolean
        autoplayMs?: number
      }
      newArrivals?: {
        enabled?: boolean
        autoplayMs?: number
      }
      featured?: {
        enabled?: boolean
        autoplayMs?: number
      }
      brandSpotlights?: {
        enabled?: boolean
        autoplayMs?: number
      }
    }
    rails?: Array<{
      id: string
      enabled?: boolean
      title: LocalizedString
      query?: {
        source?: 'best_sellers' | 'new_arrivals' | 'bundle_only' | 'manual_ids'
        limit?: number
        sortBy?: 'price_desc' | 'price_asc' | 'name_asc' | 'name_desc'
        productIds?: string[]
        brandNames?: string[]
      }
    }>
    completeSet?: {
      enabled?: boolean
      title: LocalizedString
      subtitle?: LocalizedString
      ctaLabel?: LocalizedString
      ctaHref?: string
      query?: {
        source?: 'best_sellers' | 'new_arrivals' | 'bundle_only' | 'manual_ids'
        limit?: number
        sortBy?: 'price_desc' | 'price_asc' | 'name_asc' | 'name_desc'
        productIds?: string[]
        brandNames?: string[]
      }
    }
    featuredSlot?: {
      enabled?: boolean
      title: LocalizedString
      subtitle?: LocalizedString
      ctaLabel?: LocalizedString
      href?: string
      imageUrl?: string
    }
    brandSections?: Array<{
      id: string
      enabled?: boolean
      bannerTitle: LocalizedString
      bannerSubtitle?: LocalizedString
      bannerCtaLabel?: LocalizedString
      bannerHref?: string
      bannerImageUrl?: string
      railTitle: LocalizedString
      query?: {
        source?: 'best_sellers' | 'new_arrivals' | 'bundle_only' | 'manual_ids'
        limit?: number
        sortBy?: 'price_desc' | 'price_asc' | 'name_asc' | 'name_desc'
        productIds?: string[]
        brandNames?: string[]
      }
    }>
    brandSpotlights?: Array<{
      id: string
      enabled?: boolean
      bannerTitle: LocalizedString
      bannerSubtitle?: LocalizedString
      bannerCtaLabel?: LocalizedString
      bannerHref?: string
      bannerImageUrl?: string
      railTitle: LocalizedString
      query?: {
        source?: 'best_sellers' | 'new_arrivals' | 'bundle_only' | 'manual_ids'
        limit?: number
        sortBy?: 'price_desc' | 'price_asc' | 'name_asc' | 'name_desc'
        productIds?: string[]
        brandNames?: string[]
      }
    }>
    offerBanners?: Array<{
      id: string
      enabled?: boolean
      title: LocalizedString
      subtitle?: LocalizedString
      ctaLabel?: LocalizedString
      href?: string
      imageUrl?: string
      badgeLabel?: LocalizedString
    }>
    editorialHotspotSection?: {
      enabled?: boolean
      title?: LocalizedString
      subtitle?: LocalizedString
      ctaLabel?: LocalizedString
      href?: string
      imageUrl?: string
      productIds?: string[]
      hotspots?: Array<{
        id: string
        productId: string
        xPercent: number
        yPercent: number
        label?: LocalizedString
      }>
    }
    ticker?: {
      enabled?: boolean
      speedMs?: number
      items?: Array<{
        id: string
        message: LocalizedString
        href?: string
      }>
    }
    hero?: {
      autoplay?: boolean
      autoplayMs?: number
      cards?: Array<{
        id: string
        title: string
        subtitle?: string
        ctaLabel?: string
        href?: string
        imageUrl?: string
        badgeLabel?: LocalizedString
      }>
    }
    campaigns?: MarketingCampaign[]
    campaignZoneOverrides?: {
      home?: {
        heroPrimaryCampaignId?: string
        flashSaleCampaignId?: string
        inlineBannerCampaignId?: string
      }
      shop?: {
        bannerCampaignId?: string
        flashSaleCampaignId?: string
      }
      productCard?: {
        urgencyEnabled?: boolean
        urgencyLabel?: LocalizedString
        discountBadgeEnabled?: boolean
        lowStockThreshold?: number
        lowStockLabel?: LocalizedString
      }
    }
    brands?: Array<{
      id: string
      name: string
      href?: string
      logoUrl?: string
    }>
    topBrandsTitle?: LocalizedString
    educationBanner?: {
      enabled?: boolean
      title: LocalizedString
      subtitle?: LocalizedString
      ctaLabel?: LocalizedString
      href?: string
      imageUrl?: string
    }
    ugcGallery?: {
      enabled?: boolean
      title?: LocalizedString
      items: Array<{
        id: string
        imageUrl: string
        caption?: LocalizedString
        href?: string
        productId?: string
      }>
    }
    newsletterCta?: {
      enabled?: boolean
      title?: LocalizedString
      subtitle?: LocalizedString
      ctaLabel?: LocalizedString
      href?: string
    }
    personalization?: {
      enabled?: boolean
      mode?: 'static' | 'rule-based' | 'ai'
      recommendedTitle?: LocalizedString
    }
    marketplace?: {
      gridDensity?: 'compact' | 'dense'
      railSizePreset?: 'compact' | 'dense'
      promoInsertion?: {
        home?: number[]
        shop?: number[]
        search?: number[]
      }
      stickyListingPromo?: {
        enabled?: boolean
        badgeLabel?: LocalizedString
        title?: LocalizedString
        subtitle?: LocalizedString
        ctaLabel?: LocalizedString
        href?: string
      }
      pdpOfferCluster?: {
        enabled?: boolean
        badgeLabel?: LocalizedString
        title?: LocalizedString
        subtitle?: LocalizedString
      }
      cartUpsellRail?: {
        enabled?: boolean
        title?: LocalizedString
        query?: {
          source?: 'best_sellers' | 'new_arrivals' | 'bundle_only' | 'manual_ids'
          limit?: number
          sortBy?: 'price_desc' | 'price_asc' | 'name_asc' | 'name_desc'
          productIds?: string[]
          brandNames?: string[]
        }
      }
    }
    homeBlocks?: CMSHomeBlock[]
  }
  identity?: {
    customer?: {
      shopBanner?: {
        title: LocalizedString
        subtitle?: LocalizedString
        ctaLabel?: LocalizedString
      }
      shopCatalog?: {
        loadingLabel?: LocalizedString
        loadErrorTitle?: LocalizedString
        retryLabel?: LocalizedString
        productsSuffix?: LocalizedString
        filtersButtonLabel?: LocalizedString
        filterPanelTitle?: LocalizedString
        filterCategoryTitle?: LocalizedString
        filterBrandTitle?: LocalizedString
        filterPriceTitle?: LocalizedString
        filterSpecialTitle?: LocalizedString
        saleOnlyLabel?: LocalizedString
        bundleOnlyLabel?: LocalizedString
        clearAllLabel?: LocalizedString
        clearFiltersLabel?: LocalizedString
        noProductsMessage?: LocalizedString
        closeLabel?: LocalizedString
        sortLabels?: {
          bestSelling?: LocalizedString
          newest?: LocalizedString
          priceAsc?: LocalizedString
          priceDesc?: LocalizedString
        }
        chipPrefixes?: {
          category?: LocalizedString
          brand?: LocalizedString
          price?: LocalizedString
        }
        priceBucketLabels?: {
          all?: LocalizedString
          under25?: LocalizedString
          between25And50?: LocalizedString
          between50And100?: LocalizedString
          over100?: LocalizedString
        }
      }
      accountPromo?: {
        title: LocalizedString
        subtitle?: LocalizedString
      }
      productDetails?: {
        tabs?: {
          description?: LocalizedString
          howToUse?: LocalizedString
          ingredients?: LocalizedString
        }
        labels?: {
          inStock?: LocalizedString
          outOfStock?: LocalizedString
          quantity?: LocalizedString
          noSelectableOptions?: LocalizedString
          deliveryAssurance?: LocalizedString
          selectedSubtotal?: LocalizedString
          reviewsTitle?: LocalizedString
          loading?: LocalizedString
          noReviews?: LocalizedString
          reviewsLoadError?: LocalizedString
          addToCart?: LocalizedString
          addShort?: LocalizedString
          adding?: LocalizedString
          notifyMe?: LocalizedString
          completeSetOutOfStock?: LocalizedString
          submitError?: LocalizedString
        }
        defaults?: {
          description?: LocalizedString
          howToUse?: LocalizedString
          ingredients?: LocalizedString
        }
        deliveryHighlights?: Array<LocalizedString>
        stockMessages?: {
          limitedStock?: LocalizedString
          readyDispatch?: LocalizedString
          outOfStock?: LocalizedString
        }
        crossSellByProduct?: Array<{
          productId: string
          relatedProductIds: string[]
        }>
      }
      checkoutNotice?: LocalizedString
      checkout?: {
        paymentMethods?: {
          codEnabled?: boolean
          cardOnDeliveryEnabled?: boolean
          onlineCardEnabled?: boolean
        }
        fulfillment?: {
          deliveryEnabled?: boolean
          branchPickupEnabled?: boolean
        }
        branches?: Array<{
          id: string
          name: LocalizedString
          city?: LocalizedString
          area?: LocalizedString
          building?: LocalizedString
          stockCount: number
          distanceKm?: number
          payAtBranchEnabled?: boolean
          payNowEnabled?: boolean
        }>
      }
      loyalty?: {
        pointToCurrency?: number
        earnRatePerCurrency?: number
        tiers?: Array<{
          id: string
          name: string
          minPoints: number
        }>
        tierThresholds?: {
          gold?: number
          loyal?: number
        }
        redeemOptions?: Array<{
          percent: number
          pointsCost: number
        }>
      }
    }
    pharmacist?: {
      dashboardTitle?: LocalizedString
      panelLabels?: {
        search: LocalizedString
        consultation: LocalizedString
        recommendations: LocalizedString
      }
      notice?: LocalizedString
    }
    admin?: {
      dashboardTitle?: LocalizedString
      kpiLabels?: Array<{
        id: string
        label: LocalizedString
      }>
      notice?: LocalizedString
      controlToggles?: Array<{
        id: string
        label: LocalizedString
        description?: LocalizedString
        enabled: boolean
        surface: 'all' | 'web' | 'mobile'
      }>
      rolePreview?: Array<{
        id: string
        name: string
        email: string
        role: AuthRole
        status: 'active' | 'invited' | 'disabled'
        lastActiveAt?: string
        permissions?: AdminPermissionSet
      }>
    }
  }
}

export type ApiResponse<T> =
  | {
      success: true
      data: T
    }
  | {
      success: false
      error: {
        code: string
        message: string
      }
    }

export type SearchSuggestion = {
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

export type SearchResult = {
  suggestions: SearchSuggestion[]
  trendingSearches: string[]
  popularBrands: string[]
}

export type OrderStatus = 'placed' | 'shipped' | 'delivered' | 'cancelled'

export type OrderSummary = {
  id: string
  ownerUserId?: string
  status: OrderStatus
  total: number
  currency: string
  createdAt: string
  pricing?: {
    subtotal: number
    delivery: number
    discount: number
  }
  fulfillment?: {
    mode: 'delivery' | 'pickup'
    paymentMethod: 'cod' | 'card_on_delivery' | 'online_card' | 'pay_at_branch'
    addressLine?: string
    branchName?: string
  }
  items?: Array<{
    productId: string
    brand?: string
    name: string
    quantity: number
    price: number
    currency: string
    imageUrl?: string
  }>
}

export type CheckoutPlaceOrderInput = {
  items?: Array<{
    productId: string
    quantity: number
  }>
  contact: {
    fullName: string
    phone: string
  }
  address?: {
    city: string
    area: string
    building: string
    floor?: string
    apartment?: string
    notes?: string
  }
  addressBook?: {
    saveAsNew?: boolean
    label?: string
  }
  loyalty?: {
    redeemPercent?: number
  }
  fulfillment: {
    mode: 'delivery' | 'pickup'
    branchId?: string
  }
  payment: {
    method: 'cod' | 'card_on_delivery' | 'online_card' | 'pay_at_branch'
  }
  pricingQuoteId: string
  couponCode?: string
}

export type AuthRole =
  | 'customer'
  | 'pharmacist'
  | 'admin'
  | 'marketing'
  | 'catalog'
  | 'support'
  | 'ops'

export type AuthSession = {
  userId: string
  email: string
  name: string
  role: AuthRole
}

export type AuthAck = {
  accepted: boolean
}

export type AdminPermissionSet = {
  canManageCmsToggles: boolean
  canManageUsers: boolean
  canRunCacheOps: boolean
}

export type AdminCacheAction =
  | 'revalidate_home_shop'
  | 'revalidate_all_public'
  | 'revalidate_account_surfaces'
  | 'revalidate_admin_surfaces'
  | 'full_stack_flush'

export type AdminCacheResult = {
  action: AdminCacheAction
  executedAt: string
  executedBy: {
    userId: string
    email: string
    role: AuthRole
  }
  revalidatedPaths: string[]
  revalidatedTags: string[]
  cdn: {
    enabled: boolean
    attempted: boolean
    success: boolean
    statusCode?: number
    message?: string
  }
  cooldownSeconds: number
}

export type AdminCacheAuditEntry = AdminCacheResult & {
  id: string
}

export type AdminControlToggleUpdate = {
  id: string
  enabled: boolean
  updatedAt: string
  updatedBy: {
    userId: string
    email: string
  }
}

export type HomeBrandSpotlightConfig = NonNullable<
  NonNullable<CMSHome['marketing']>['brandSpotlights']
>[number]

export type AdminBrandSpotlightRecord = HomeBrandSpotlightConfig & {
  updatedAt: string | null
  updatedBy: {
    userId: string
    email: string
  } | null
}

export type HomeOfferBannerConfig = NonNullable<
  NonNullable<CMSHome['marketing']>['offerBanners']
>[number]

export type AdminOfferBannerRecord = HomeOfferBannerConfig & {
  updatedAt: string | null
  updatedBy: {
    userId: string
    email: string
  } | null
}

export type AdminUserControlRecord = {
  id: string
  name: string
  email: string
  role: AuthRole
  status: 'active' | 'invited' | 'disabled'
  lastActiveAt?: string
  permissions?: AdminPermissionSet
}

export type AdminOpsAuditEntry = {
  id: string
  type: 'toggle' | 'user' | 'marketing' | 'i18n'
  targetId: string
  actor: {
    userId: string
    email: string
  }
  at: string
  changes: Record<string, string>
}

export type Review = {
  id: string
  productId: string
  rating: number
  title: string
  body: string
  author: string
  createdAt: string
}

export type AccountOverview = {
  user: {
    userId: string
    name: string
    email: string
    role: AuthRole
  }
  loyaltySummary: {
    tier: string
    points: number
    redeemableValue: number
    currency: string
  } | null
  lastOrder: OrderSummary | null
}

export type LoyaltyRedeemOption = {
  percent: number
  pointsCost: number
}

export type LoyaltyBarcode = {
  code: string
  expiresAt: string
}

export type LoyaltyWallet = {
  tier: string
  points: number
  redeemableValue: number
  currency: string
  expiringSoonPoints: number
  expiringSoonAt: string | null
  redeemOptions: LoyaltyRedeemOption[]
  barcode: LoyaltyBarcode
  tierProgress: {
    currentTierId: string
    currentTierName: string
    nextTierId: string | null
    nextTierName: string | null
    currentPoints: number
    nextTierThreshold: number | null
    pointsToNextTier: number
    progressPercent: number
  }
}

export type AccountAddress = {
  id: string
  label: string
  city: string
  area: string
  building: string
  floor?: string
  apartment?: string
  isDefault?: boolean
}

export type LoyaltyHistoryEntry = {
  id: string
  title: string
  pointsDelta: number
  createdAt: string
}

export type WishlistItem = {
  id: string
  brand?: string
  name: string
  price: number
  currency: string
  imageUrl?: string
}

export type AccountTestRecord = {
  id: string
  title: string
  createdAt: string
  status?: 'completed' | 'follow_up'
  recommendedCount: number
  purchasedCount: number
}

export type AccountTestRecommendedProduct = {
  productId: string
  brand?: string
  name: string
  price: number
  currency: string
  imageUrl?: string
  inStock?: boolean
}

export type AccountTestDetail = {
  id: string
  title: string
  createdAt: string
  status: 'completed' | 'follow_up'
  pharmacistName: string
  branchName: string
  summary: string
  notes?: string
  metrics: Array<{
    id: string
    label: string
    value: string
  }>
  recommendedProducts: AccountTestRecommendedProduct[]
}

export type AccountQr = {
  qrCode: string
}

export type PharmacistCustomerSummary = {
  userId: string
  name: string
  email: string
  phone?: string
  qrCode: string
  testCount: number
  lastTestAt?: string
}

export type PharmacistCustomerProfile = {
  customer: PharmacistCustomerSummary
  tests: AccountTestRecord[]
}

export type PharmacistConsultationMetricInput = {
  id: string
  label: string
  value: string
}

export type PharmacistConsultationInput = {
  customerId: string
  title: string
  summary: string
  notes?: string
  metrics: PharmacistConsultationMetricInput[]
  recommendedProductIds: string[]
}

export type PharmacistConsultationDraft = {
  customer: PharmacistCustomerSummary
  title: string
  summary: string
  notes?: string
  metrics: PharmacistConsultationMetricInput[]
  recommendedProducts: AccountTestRecommendedProduct[]
}

export type AdminCatalogColumn = {
  id: string
  label: string
  path: string           // matches sourceColumns entry, e.g. "source.vendor_sku"
  mode: 'custom' | 'source'
}

export type AdminCategoryRecord = {
  id: string
  nameEn: string
  nameAr: string
  slug: string
  parentId?: string
  productCount: number
  sortOrder: number
  status: 'visible' | 'hidden'
  sourceId?: string
  image?: string
  metaTitle?: string
  metaDescription?: string
  createdAt: string
  updatedAt: string
}

export type AdminBrandRecord = {
  id: string
  nameEn: string
  nameAr: string
  slug: string
  productCount: number
  status: 'visible' | 'hidden'
  sourceId?: string
  logoUrl?: string
  description?: string
  websiteUrl?: string
  createdAt: string
  updatedAt: string
}

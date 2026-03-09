import { ProviderResult } from './types'

export type LocalizedText = {
  en: string
  ar: string
}

export type LogoSizeKey = 'sm' | 'md' | 'lg'

export type CMSHome = {
  heroSlides: Array<{
    id: string
    title: string
    subtitle?: string
    ctaLabel?: string
  }>
  shell?: {
    topBar?: {
      message: LocalizedText
      ctaLabel?: LocalizedText
      ctaHref?: string
    }
    branding?: {
      logo: {
        uri: string
        alt: LocalizedText
      }
      logoSize?: LogoSizeKey
    }
    navigation?: {
      categories?: Array<{
        id: string
        label: LocalizedText
        href: string
        group?: string
        description?: LocalizedText
      }>
    }
    footer?: {
      newsletterTitle?: LocalizedText
      newsletterSubtitle?: LocalizedText
      legalNotice?: LocalizedText
      socialLabels?: Array<{
        id: string
        label: LocalizedText
      }>
    }
    search?: {
      panelTitles?: {
        trendingSearches?: LocalizedText
        popularBrands?: LocalizedText
        recentSearches?: LocalizedText
        suggestions?: LocalizedText
        products?: LocalizedText
      }
      panelMessages?: {
        loadingSuggestions?: LocalizedText
        unavailableSuggestions?: LocalizedText
        noMatchingSuggestions?: LocalizedText
        noProductSuggestions?: LocalizedText
        noPopularBrands?: LocalizedText
        noRecentSearches?: LocalizedText
      }
      clearRecentLabel?: LocalizedText
    }
  }
  marketing?: {
    rails?: Array<{
      id: string
      enabled?: boolean
      title: LocalizedText
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
      title: LocalizedText
      subtitle?: LocalizedText
      ctaLabel?: LocalizedText
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
      title: LocalizedText
      subtitle?: LocalizedText
      ctaLabel?: LocalizedText
      href?: string
      imageUrl?: string
    }
    brandSections?: Array<{
      id: string
      enabled?: boolean
      bannerTitle: LocalizedText
      bannerSubtitle?: LocalizedText
      bannerCtaLabel?: LocalizedText
      bannerHref?: string
      bannerImageUrl?: string
      railTitle: LocalizedText
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
      bannerTitle: LocalizedText
      bannerSubtitle?: LocalizedText
      bannerCtaLabel?: LocalizedText
      bannerHref?: string
      bannerImageUrl?: string
      railTitle: LocalizedText
      query?: {
        source?: 'best_sellers' | 'new_arrivals' | 'bundle_only' | 'manual_ids'
        limit?: number
        sortBy?: 'price_desc' | 'price_asc' | 'name_asc' | 'name_desc'
        productIds?: string[]
        brandNames?: string[]
      }
    }>
    ticker?: {
      enabled?: boolean
      speedMs?: number
      items?: Array<{
        id: string
        message: LocalizedText
        href?: string
      }>
    }
  }
  identity?: {
    customer?: {
      shopBanner?: {
        title: LocalizedText
        subtitle?: LocalizedText
        ctaLabel?: LocalizedText
      }
      shopCatalog?: {
        loadingLabel?: LocalizedText
        loadErrorTitle?: LocalizedText
        retryLabel?: LocalizedText
        productsSuffix?: LocalizedText
        filtersButtonLabel?: LocalizedText
        filterPanelTitle?: LocalizedText
        filterCategoryTitle?: LocalizedText
        filterBrandTitle?: LocalizedText
        filterPriceTitle?: LocalizedText
        filterSpecialTitle?: LocalizedText
        saleOnlyLabel?: LocalizedText
        bundleOnlyLabel?: LocalizedText
        clearAllLabel?: LocalizedText
        clearFiltersLabel?: LocalizedText
        noProductsMessage?: LocalizedText
        closeLabel?: LocalizedText
        sortLabels?: {
          bestSelling?: LocalizedText
          newest?: LocalizedText
          priceAsc?: LocalizedText
          priceDesc?: LocalizedText
        }
        chipPrefixes?: {
          category?: LocalizedText
          brand?: LocalizedText
          price?: LocalizedText
        }
        priceBucketLabels?: {
          all?: LocalizedText
          under25?: LocalizedText
          between25And50?: LocalizedText
          between50And100?: LocalizedText
          over100?: LocalizedText
        }
      }
      accountPromo?: {
        title: LocalizedText
        subtitle?: LocalizedText
      }
      productDetails?: {
        tabs?: {
          description?: LocalizedText
          howToUse?: LocalizedText
          ingredients?: LocalizedText
        }
        labels?: {
          inStock?: LocalizedText
          outOfStock?: LocalizedText
          quantity?: LocalizedText
          noSelectableOptions?: LocalizedText
          deliveryAssurance?: LocalizedText
          selectedSubtotal?: LocalizedText
          reviewsTitle?: LocalizedText
          loading?: LocalizedText
          noReviews?: LocalizedText
          reviewsLoadError?: LocalizedText
          addToCart?: LocalizedText
          addShort?: LocalizedText
          adding?: LocalizedText
          notifyMe?: LocalizedText
          completeSetOutOfStock?: LocalizedText
          submitError?: LocalizedText
        }
        defaults?: {
          description?: LocalizedText
          howToUse?: LocalizedText
          ingredients?: LocalizedText
        }
        deliveryHighlights?: Array<LocalizedText>
        stockMessages?: {
          limitedStock?: LocalizedText
          readyDispatch?: LocalizedText
          outOfStock?: LocalizedText
        }
        crossSellByProduct?: Array<{
          productId: string
          relatedProductIds: string[]
        }>
      }
      checkoutNotice?: LocalizedText
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
          name: LocalizedText
          city?: LocalizedText
          area?: LocalizedText
          building?: LocalizedText
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
      dashboardTitle?: LocalizedText
      panelLabels?: {
        search: LocalizedText
        consultation: LocalizedText
        recommendations: LocalizedText
      }
      notice?: LocalizedText
    }
    admin?: {
      dashboardTitle?: LocalizedText
      kpiLabels?: Array<{
        id: string
        label: LocalizedText
      }>
      notice?: LocalizedText
    }
  }
}

export interface CMSProvider {
  getHome(): Promise<ProviderResult<CMSHome>>
}

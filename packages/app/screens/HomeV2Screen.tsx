import { useMemo } from 'react'
import { resolveMarketingCampaign } from '@real/app/lib/campaigns'
import { HomeV2Sections } from '@real/app/sections/home/HomeV2Sections'
import { CMSHome, Product } from '@real/app/lib/types'
import { HomeBrandItem, HomeProductItem } from '@real/ui/components/home/types'
import { applyProductFilter } from '@real/app/lib/product-filter'
import { passThroughPricingService } from '@real/app/lib/pricing'

type HomeV2ScreenProps = {
  cmsHome?: CMSHome | null
  products: Product[]
  loading: boolean
  error: string | null
  onReload: () => void
  locale?: 'en' | 'ar'
  onNavigate?: (href: string) => void
  onSelectProduct?: (productId: string) => void
  onAddToCart?: (productId: string) => void
}

function deriveBrand(name: string) {
  const [left] = name.split('-')
  return left?.trim() || 'Brand'
}

function deriveProductName(name: string) {
  const split = name.split('-')
  if (split.length < 2) {
    return name
  }
  return split.slice(1).join('-').trim()
}

function toHomeProductItem(product: Product): HomeProductItem {
  const resolvedPrice = passThroughPricingService.getProductPrice(product)
  return {
    id: product.id,
    name: deriveProductName(product.name),
    brand: deriveBrand(product.name),
    price: resolvedPrice.unitPrice,
    imageUrl: product.image,
    href: `/product/${product.id}`,
    rating: product.rating,
    reviews: product.reviews,
    isNew: product.isNew,
    isLimited: product.isLimited,
    stock: product.stock,
  }
}

function resolveRailProducts(
  allProducts: Product[],
  query?: {
    source?: 'best_sellers' | 'new_arrivals' | 'bundle_only' | 'manual_ids'
    limit?: number
    sortBy?: 'price_desc' | 'price_asc' | 'name_asc' | 'name_desc'
    productIds?: string[]
    brandNames?: string[]
  }
) {
  const source = query?.source ?? 'best_sellers'
  const limit = Math.max(1, query?.limit ?? 12)
  const brandFilter = (query?.brandNames ?? []).map((name) => name.trim().toLowerCase().replace(/\s+/g, '-'))

  if (source === 'manual_ids') {
    return applyProductFilter(allProducts, {
      ids: query?.productIds ?? [],
      brand: brandFilter.length > 0 ? brandFilter : undefined,
      sort: query?.sortBy === 'price_asc' ? 'price_asc' : query?.sortBy === 'price_desc' ? 'price_desc' : undefined,
      limit,
    })
  }

  if (source === 'new_arrivals') {
    return applyProductFilter(allProducts, {
      brand: brandFilter.length > 0 ? brandFilter : undefined,
      sort: 'newest',
      limit,
    })
  }

  if (source === 'bundle_only') {
    return applyProductFilter(allProducts, {
      brand: brandFilter.length > 0 ? brandFilter : undefined,
      onSale: true,
      sort: 'bestseller',
      limit,
    })
  }

  return applyProductFilter(allProducts, {
    brand: brandFilter.length > 0 ? brandFilter : undefined,
    sort: 'bestseller',
    limit,
  })
}

function formatCountdown(timerEndsAt: string | undefined) {
  if (!timerEndsAt) return undefined
  const end = new Date(timerEndsAt).getTime()
  const now = Date.now()
  const delta = end - now
  if (Number.isNaN(end) || delta <= 0) return undefined
  const hours = Math.floor(delta / (1000 * 60 * 60))
  const minutes = Math.floor((delta % (1000 * 60 * 60)) / (1000 * 60))
  return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m left`
}

export function HomeV2Screen({
  cmsHome,
  products,
  loading,
  error,
  onReload,
  locale = 'en',
  onNavigate,
  onSelectProduct,
  onAddToCart,
}: HomeV2ScreenProps) {
  const heroCampaign = useMemo(
    () => resolveMarketingCampaign(cmsHome, locale, 'home_hero_primary'),
    [cmsHome, locale],
  )
  const flashCampaign = useMemo(
    () => resolveMarketingCampaign(cmsHome, locale, 'home_flash_sale'),
    [cmsHome, locale],
  )
  const productCardUrgency = useMemo(() => {
    const config = cmsHome?.marketing?.campaignZoneOverrides?.productCard
    if (!config || config.urgencyEnabled === false) return undefined
    return config.urgencyLabel
      ? locale === 'ar'
        ? config.urgencyLabel.ar
        : config.urgencyLabel.en
      : undefined
  }, [cmsHome?.marketing?.campaignZoneOverrides?.productCard, locale])
  const productCardLowStockThreshold = useMemo(() => {
    const value = cmsHome?.marketing?.campaignZoneOverrides?.productCard?.lowStockThreshold
    if (typeof value !== 'number' || value < 1) return undefined
    return Math.floor(value)
  }, [cmsHome?.marketing?.campaignZoneOverrides?.productCard?.lowStockThreshold])
  const productCardLowStockLabel = useMemo(() => {
    const config = cmsHome?.marketing?.campaignZoneOverrides?.productCard
    if (!config?.lowStockLabel) return undefined
    return locale === 'ar' ? config.lowStockLabel.ar : config.lowStockLabel.en
  }, [cmsHome?.marketing?.campaignZoneOverrides?.productCard, locale])

  const resolveProductCardUrgency = (product: Product) => {
    if (
      typeof product.stock === 'number' &&
      product.stock > 0 &&
      typeof productCardLowStockThreshold === 'number' &&
      product.stock <= productCardLowStockThreshold &&
      productCardLowStockLabel
    ) {
      return productCardLowStockLabel
    }
    return productCardUrgency
  }

  const heroItems = useMemo(() => {
    const cards = cmsHome?.marketing?.hero?.cards ?? []
    if (cards.length > 0 || heroCampaign) {
      const resolvedCards =
        cards.length > 0
          ? cards.map((card) => ({
              ...card,
              badgeLabel: card.badgeLabel ? (locale === 'ar' ? card.badgeLabel.ar : card.badgeLabel.en) : undefined,
            }))
          : []
      if (!heroCampaign) {
        return resolvedCards
      }
      const heroLead = {
        id: heroCampaign.id,
        title: heroCampaign.title,
        subtitle:
          heroCampaign.showUrgency && heroCampaign.urgencyBadge
            ? `${heroCampaign.urgencyBadge} • ${heroCampaign.subtitle ?? ''}`.trim()
            : heroCampaign.subtitle,
        ctaLabel: heroCampaign.ctaLabel,
        href: heroCampaign.href,
        imageUrl: heroCampaign.imageUrl,
        badgeLabel: heroCampaign.urgencyBadge ?? heroCampaign.title,
      }
      return [heroLead, ...resolvedCards.filter((item) => item.id !== heroCampaign.id)]
    }
    return cmsHome?.heroSlides.map((slide) => ({
      id: slide.id,
      title: slide.title,
      subtitle: slide.subtitle,
      ctaLabel: slide.ctaLabel,
      href: '/shop',
    })) ?? []
  }, [cmsHome, heroCampaign])

  const tickerItems = useMemo(() => {
    const cmsItems = cmsHome?.marketing?.ticker?.items ?? []
    if (cmsItems.length > 0) {
      return cmsItems.map((item) => ({
        id: item.id,
        label: locale === 'ar' ? item.message.ar : item.message.en,
        href: item.href,
      }))
    }

    const shellMessage = cmsHome?.shell?.topBar?.message
    if (!shellMessage) {
      return []
    }

    return [
      {
        id: 'shell-topbar-fallback',
        label: locale === 'ar' ? shellMessage.ar : shellMessage.en,
      },
    ]
  }, [cmsHome, locale])

  const cmsRails = useMemo(() => {
    const rails = cmsHome?.marketing?.rails ?? []
    if (rails.length > 0) {
      return rails
    }
    return [
      {
        id: 'best-items-month',
        enabled: true,
        title: {
          en: 'Best Items for This Month',
          ar: 'أفضل المنتجات لهذا الشهر',
        },
        query: {
          source: 'best_sellers' as const,
          limit: 12,
          sortBy: 'price_desc' as const,
        },
      },
    ]
  }, [cmsHome?.marketing?.rails])

  const resolvedFlow = useMemo(() => {
    const enabledRails = cmsRails.filter((rail) => rail.enabled ?? true)
    const flashRail = enabledRails.find(
      (rail) =>
        rail.query?.source === 'bundle_only' ||
        rail.id.toLowerCase().includes('bundle') ||
        rail.id.toLowerCase().includes('flash'),
    )
    const primaryRail =
      enabledRails.find(
        (rail) =>
          rail.id === 'best-items-month' ||
          (rail.query?.source !== 'bundle_only' &&
            !rail.id.toLowerCase().includes('bundle') &&
            !rail.id.toLowerCase().includes('flash')),
      ) ?? enabledRails.find((rail) => rail.id !== flashRail?.id)

    const resolveRail = (rail: (typeof enabledRails)[number] | undefined) => {
      if (!rail) {
        return null
      }
      return {
        id: rail.id,
        source: rail.query?.source ?? 'best_sellers',
        title: locale === 'ar' ? rail.title.ar : rail.title.en,
        items: resolveRailProducts(products, rail.query).map((item) => ({
          ...toHomeProductItem(item),
          urgencyLabel: resolveProductCardUrgency(item),
        })),
      }
    }

    return {
      flash: resolveRail(flashRail),
      primary: resolveRail(primaryRail),
    }
  }, [cmsRails, locale, productCardLowStockLabel, productCardLowStockThreshold, productCardUrgency, products])
  const hasFlashRail = Boolean(resolvedFlow.flash)

  const featuredSlot = useMemo(() => {
    // Keep one dominant flash/urgency zone near the top to avoid competing conversion blocks.
    if (hasFlashRail && flashCampaign) {
      return null
    }
    if (flashCampaign) {
      const timerLabel = flashCampaign.showTimer ? formatCountdown(flashCampaign.timerEndsAt) : undefined
      return {
        title: flashCampaign.showUrgency && flashCampaign.urgencyBadge
          ? `${flashCampaign.urgencyBadge} • ${flashCampaign.title}`
          : flashCampaign.title,
        subtitle: timerLabel
          ? `${flashCampaign.subtitle ?? ''} ${timerLabel}`.trim()
          : flashCampaign.subtitle,
        ctaLabel: flashCampaign.ctaLabel,
        href: flashCampaign.href,
        imageUrl: flashCampaign.imageUrl,
      }
    }

    const slot = cmsHome?.marketing?.featuredSlot
    if (!slot || slot.enabled === false) {
      return null
    }
    return {
      title: locale === 'ar' ? slot.title.ar : slot.title.en,
      subtitle: slot.subtitle ? (locale === 'ar' ? slot.subtitle.ar : slot.subtitle.en) : undefined,
      ctaLabel: slot.ctaLabel ? (locale === 'ar' ? slot.ctaLabel.ar : slot.ctaLabel.en) : undefined,
      href: slot.href,
      imageUrl: slot.imageUrl,
    }
  }, [cmsHome?.marketing?.featuredSlot, flashCampaign, hasFlashRail, locale])

  const brandSpotlights = useMemo(() => {
    const sections =
      cmsHome?.marketing?.brandSpotlights && cmsHome.marketing.brandSpotlights.length > 0
        ? cmsHome.marketing.brandSpotlights
        : (cmsHome?.marketing?.brandSections ?? [])

    return sections
      .filter((section) => section.enabled ?? true)
      .map((section) => ({
        id: section.id,
        bannerTitle: locale === 'ar' ? section.bannerTitle.ar : section.bannerTitle.en,
        bannerSubtitle: section.bannerSubtitle
          ? locale === 'ar'
            ? section.bannerSubtitle.ar
            : section.bannerSubtitle.en
          : undefined,
        bannerCtaLabel: section.bannerCtaLabel
          ? locale === 'ar'
            ? section.bannerCtaLabel.ar
            : section.bannerCtaLabel.en
          : undefined,
        bannerHref: section.bannerHref,
        bannerImageUrl: section.bannerImageUrl,
        railTitle: locale === 'ar' ? section.railTitle.ar : section.railTitle.en,
        items: resolveRailProducts(products, section.query).map((item) => ({
          ...toHomeProductItem(item),
          urgencyLabel: resolveProductCardUrgency(item),
        })),
      }))
  }, [
    cmsHome?.marketing?.brandSections,
    cmsHome?.marketing?.brandSpotlights,
    locale,
    productCardLowStockLabel,
    productCardLowStockThreshold,
    productCardUrgency,
    products,
  ])
  const primaryBrandSpotlight = brandSpotlights[0] ?? null

  const topBrands = useMemo(() => {
    const brands = cmsHome?.marketing?.brands ?? []
    const mapped: HomeBrandItem[] = brands.slice(0, 8).map((item) => ({
      id: item.id,
      name: item.name,
      href: item.href,
      logoUrl: item.logoUrl,
    }))
    return mapped
  }, [cmsHome?.marketing?.brands])

  const topBrandsTitle = useMemo(() => {
    const title = cmsHome?.marketing?.topBrandsTitle
    if (!title) {
      return undefined
    }
    return locale === 'ar' ? title.ar : title.en
  }, [cmsHome?.marketing?.topBrandsTitle, locale])

  return (
    <HomeV2Sections
      heroItems={heroItems}
      tickerItems={tickerItems}
      flashRail={resolvedFlow.flash}
      primaryRail={resolvedFlow.primary}
      featuredSlot={featuredSlot}
      spotlight={primaryBrandSpotlight}
      topBrandsTitle={topBrandsTitle}
      topBrands={topBrands}
      loading={loading}
      error={error}
      tickerSpeedMs={cmsHome?.marketing?.ticker?.speedMs ?? 22000}
      heroAutoplay={cmsHome?.marketing?.hero?.autoplay ?? true}
      heroAutoplayMs={cmsHome?.marketing?.hero?.autoplayMs ?? 4200}
      onReload={onReload}
      onNavigate={onNavigate}
      onSelectProduct={onSelectProduct}
      onAddToCart={onAddToCart}
    />
  )
}

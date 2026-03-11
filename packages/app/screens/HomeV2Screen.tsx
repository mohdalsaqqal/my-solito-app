import { useMemo } from 'react'
import { colors } from '@real/tokens'
import { resolveMarketingCampaign } from '@real/app/lib/campaigns'
import { HomeV2Sections } from '@real/app/sections/home/HomeV2Sections'
import { CMSHome, Product } from '@real/app/lib/types'
import {
  HomeBrandItem,
  HomeEducationBanner,
  HomeNewsletterCta,
  HomeProductItem,
  HomeUgcItem,
} from '@real/ui/components/home/types'
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

type RailQuery = {
  source?: 'best_sellers' | 'new_arrivals' | 'bundle_only' | 'manual_ids' | 'community_favorites'
  limit?: number
  sortBy?: 'price_desc' | 'price_asc' | 'name_asc' | 'name_desc'
  productIds?: string[]
  brandNames?: string[]
}

type ResolvedRail = {
  id: string
  title: string
  items: HomeProductItem[]
}

function localize(locale: 'en' | 'ar', value?: { en: string; ar: string }, fallback = '') {
  if (!value) return fallback
  return locale === 'ar' ? value.ar : value.en
}

function deriveBrand(product: Product) {
  if (product.brand) {
    return product.brand
      .split('-')
      .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
      .join(' ')
  }

  const [left] = product.name.split('-')
  return left?.trim() || 'Brand'
}

function deriveProductName(product: Product) {
  const split = product.name.split('-')
  if (split.length < 2) {
    return product.name
  }
  return split.slice(1).join('-').trim()
}

const SWATCH_PALETTE = [
  colors.brandPrimary,
  colors.warning,
  colors.info,
  colors.success,
  colors.textPrimary,
]

function toHomeProductItem(product: Product): HomeProductItem {
  const resolvedPrice = passThroughPricingService.getProductPrice(product)
  const swatches =
    product.category === 'makeup'
      ? SWATCH_PALETTE.map((hex, index) => ({
          id: `${product.id}-shade-${index + 1}`,
          hex,
          label: `Shade ${index + 1}`,
        }))
      : undefined

  return {
    id: product.id,
    name: deriveProductName(product),
    brand: deriveBrand(product),
    price: resolvedPrice.unitPrice,
    imageUrl: product.image,
    href: `/product/${product.id}`,
    rating: product.rating,
    reviews: product.reviews,
    isNew: product.isNew,
    isLimited: product.isLimited,
    stock: product.stock,
    requiresVariantSelection: product.category === 'makeup',
    swatches,
    badge: product.isLimited ? 'Limited' : product.isNew ? 'New' : undefined,
  }
}

function resolveRailProducts(allProducts: Product[], query?: RailQuery) {
  const source = query?.source ?? 'best_sellers'
  const limit = Math.max(1, query?.limit ?? 12)
  const brandFilter = (query?.brandNames ?? [])
    .map((name) => name.trim().toLowerCase().replace(/\s+/g, '-'))

  if (source === 'manual_ids') {
    return applyProductFilter(allProducts, {
      ids: query?.productIds ?? [],
      brand: brandFilter.length > 0 ? brandFilter : undefined,
      sort:
        query?.sortBy === 'price_asc'
          ? 'price_asc'
          : query?.sortBy === 'price_desc'
          ? 'price_desc'
          : undefined,
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

  if (source === 'community_favorites') {
    return [...allProducts]
      .filter((item) => (item.rating ?? 0) >= 4.5 && (item.reviews ?? 0) >= 80)
      .sort((left, right) => (right.reviews ?? 0) - (left.reviews ?? 0))
      .slice(0, limit)
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

function createFallbackTicker(locale: 'en' | 'ar') {
  return [
    {
      id: 'ticker-1',
      label: locale === 'ar' ? 'توصيل مجاني للطلبات فوق 99$' : 'Free delivery for orders above $99',
      href: '/shop',
    },
    {
      id: 'ticker-2',
      label: locale === 'ar' ? 'اشترِ 2 واحصل على 1 مجاناً' : 'Buy 2 get 1 free this week',
      href: '/shop',
    },
  ]
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
  const inlineCampaign = useMemo(
    () => resolveMarketingCampaign(cmsHome, locale, 'home_inline_banner'),
    [cmsHome, locale],
  )

  const productCardUrgency = useMemo(() => {
    const config = cmsHome?.marketing?.campaignZoneOverrides?.productCard
    if (!config || config.urgencyEnabled === false) return undefined
    return config.urgencyLabel
      ? localize(locale, config.urgencyLabel)
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
    return localize(locale, config.lowStockLabel)
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
    const resolvedCards =
      cards.length > 0
        ? cards.map((card) => ({
            ...card,
            badgeLabel: card.badgeLabel ? localize(locale, card.badgeLabel) : undefined,
          }))
        : []

    if (!heroCampaign) {
      if (resolvedCards.length > 0) {
        return resolvedCards
      }
      return cmsHome?.heroSlides.map((slide) => ({
        id: slide.id,
        title: slide.title,
        subtitle: slide.subtitle,
        ctaLabel: slide.ctaLabel,
        href: '/shop',
      })) ?? []
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
  }, [cmsHome, heroCampaign, locale])

  const tickerItems = useMemo(() => {
    const cmsItems = cmsHome?.marketing?.ticker?.items ?? []
    if (cmsItems.length > 0) {
      return cmsItems.map((item) => ({
        id: item.id,
        label: localize(locale, item.message),
        href: item.href,
      }))
    }

    const shellMessage = cmsHome?.shell?.topBar?.message
    if (shellMessage) {
      return [{ id: 'shell-topbar-fallback', label: localize(locale, shellMessage) }]
    }

    return createFallbackTicker(locale)
  }, [cmsHome, locale])

  const rails = useMemo(() => {
    const cmsRails = cmsHome?.marketing?.rails?.filter((rail) => rail.enabled ?? true) ?? []
    const resolvedRails =
      cmsRails.length > 0
        ? cmsRails
        : [
            {
              id: 'best-items-month',
              title: {
                en: 'Best Sellers',
                ar: 'الأكثر مبيعاً',
              },
              query: {
                source: 'best_sellers' as const,
                limit: 12,
              },
            },
            {
              id: 'new-arrivals',
              title: {
                en: 'New Arrivals',
                ar: 'وصل حديثاً',
              },
              query: {
                source: 'new_arrivals' as const,
                limit: 12,
              },
            },
            {
              id: 'community-favorites',
              title: {
                en: 'Community Favorites',
                ar: 'مفضلات المجتمع',
              },
              query: {
                source: 'community_favorites' as const,
                limit: 12,
              },
            },
          ]

    const asResolvedRail = (id: string, title: string, query?: RailQuery): ResolvedRail => ({
      id,
      title,
      items: resolveRailProducts(products, query).map((item) => ({
        ...toHomeProductItem(item),
        urgencyLabel: resolveProductCardUrgency(item),
      })),
    })

    const bundles = resolvedRails.find(
      (rail) =>
        rail.query?.source === 'bundle_only' ||
        rail.id.toLowerCase().includes('bundle') ||
        rail.id.toLowerCase().includes('flash'),
    )

    const bestSellers =
      resolvedRails.find((rail) => rail.id === 'best-items-month' || rail.query?.source === 'best_sellers') ??
      resolvedRails[0]

    const newArrivals = resolvedRails.find(
      (rail) => rail.query?.source === 'new_arrivals' || rail.id.toLowerCase().includes('new'),
    )

    const community = resolvedRails.find(
      (rail) =>
        rail.query?.source === 'community_favorites' ||
        rail.id.toLowerCase().includes('community') ||
        rail.id.toLowerCase().includes('favorite'),
    )

    const trending =
      resolvedRails.find(
        (rail) =>
          rail.id !== bestSellers?.id &&
          rail.id !== bundles?.id &&
          rail.id !== newArrivals?.id &&
          rail.id !== community?.id,
      ) ?? null

    return {
      bestSellers: bestSellers
        ? asResolvedRail(bestSellers.id, localize(locale, bestSellers.title), bestSellers.query)
        : null,
      trending: trending
        ? asResolvedRail(trending.id, localize(locale, trending.title), trending.query)
        : null,
      bundles: bundles
        ? asResolvedRail(bundles.id, localize(locale, bundles.title), bundles.query)
        : null,
      newArrivals: newArrivals
        ? asResolvedRail(newArrivals.id, localize(locale, newArrivals.title), newArrivals.query)
        : asResolvedRail(
            'new-arrivals-fallback',
            locale === 'ar' ? 'وصل حديثاً' : 'New Arrivals',
            { source: 'new_arrivals', limit: 12 },
          ),
      communityFavorites: community
        ? asResolvedRail(community.id, localize(locale, community.title), community.query)
        : asResolvedRail(
            'community-favorites-fallback',
            locale === 'ar' ? 'مفضلات المجتمع' : 'Community Favorites',
            { source: 'community_favorites', limit: 12 },
          ),
    }
  }, [
    cmsHome?.marketing?.rails,
    locale,
    productCardLowStockLabel,
    productCardLowStockThreshold,
    productCardUrgency,
    products,
  ])

  const personalizedRail = useMemo(() => {
    const mode = cmsHome?.marketing?.personalization?.mode ?? 'rule-based'
    const enabled = cmsHome?.marketing?.personalization?.enabled ?? true
    if (!enabled || mode === 'ai') return null

    if (mode === 'static') {
      const staticRail = cmsHome?.marketing?.rails?.find((rail) => rail.id.toLowerCase().includes('recommended'))
      if (!staticRail) return null
      return {
        id: staticRail.id,
        title: localize(locale, staticRail.title),
        items: resolveRailProducts(products, staticRail.query).map((item) => ({
          ...toHomeProductItem(item),
          urgencyLabel: resolveProductCardUrgency(item),
        })),
      }
    }

    const exclusions = new Set([
      ...(rails.bestSellers?.items ?? []),
      ...(rails.newArrivals?.items ?? []),
      ...(rails.communityFavorites?.items ?? []),
    ].map((item) => item.id))

    const ruleBased = [...products]
      .filter((item) => (item.stock ?? 0) > 0)
      .filter((item) => !exclusions.has(item.id))
      .sort((left, right) => {
        const leftScore =
          (left.rating ?? 0) * 10 +
          (left.reviews ?? 0) / 10 +
          (left.isNew ? 3 : 0) +
          (left.isLimited ? 2 : 0)
        const rightScore =
          (right.rating ?? 0) * 10 +
          (right.reviews ?? 0) / 10 +
          (right.isNew ? 3 : 0) +
          (right.isLimited ? 2 : 0)
        return rightScore - leftScore
      })
      .slice(0, 12)

    if (ruleBased.length === 0) return null

    return {
      id: 'recommended-rule-based',
      title:
        localize(locale, cmsHome?.marketing?.personalization?.recommendedTitle) ||
        (locale === 'ar' ? 'موصى بها لك' : 'Recommended for You'),
      items: ruleBased.map((item) => ({
        ...toHomeProductItem(item),
        urgencyLabel: resolveProductCardUrgency(item),
      })),
    }
  }, [cmsHome?.marketing?.personalization, cmsHome?.marketing?.rails, locale, products, rails])

  // flashSale — drives FlashSaleBand (crimson urgency band with countdown)
  const flashSale = useMemo(() => {
    if (!flashCampaign) return null
    return {
      offerText: flashCampaign.urgencyBadge || flashCampaign.title,
      preLabel: locale === 'ar' ? 'حتى' : 'up to',
      postLabel: flashCampaign.subtitle ?? '',
      endsAtIso: flashCampaign.showTimer && flashCampaign.timerEndsAt
        ? flashCampaign.timerEndsAt
        : undefined,
      ctaLabel: flashCampaign.ctaLabel,
    }
  }, [flashCampaign, locale])

  // campaignAnchor2 — drives CampaignHeroBlock ink editorial section after bestSellers
  const campaignAnchor2 = useMemo(() => {
    if (inlineCampaign) {
      return {
        headline: inlineCampaign.title,
        preHeadline: locale === 'ar' ? 'اكتشفي' : 'Discover',
        subline: inlineCampaign.subtitle,
        badgeLabel: inlineCampaign.showUrgency ? (inlineCampaign.urgencyBadge ?? undefined) : undefined,
        ctaLabel: inlineCampaign.ctaLabel,
        imageUrl: inlineCampaign.imageUrl,
        href: inlineCampaign.href,
      }
    }
    return {
      headline: locale === 'ar' ? 'وصل حديثاً' : 'New Arrivals',
      preHeadline: locale === 'ar' ? 'اكتشفي' : 'Discover',
      subline: locale === 'ar' ? 'أحدث المنتجات المختارة لك' : 'The latest drops, curated for you.',
      badgeLabel: locale === 'ar' ? 'جديد' : 'New',
      ctaLabel: locale === 'ar' ? 'تسوقي الآن' : 'Shop Now',
      href: '/new-arrivals',
    }
  }, [inlineCampaign, locale])

  // featuredSlot — flashCampaign now handled by FlashSaleBand; only use CMS featuredSlot here
  const featuredSlot = useMemo(() => {
    if (rails.bundles) return null
    const slot = cmsHome?.marketing?.featuredSlot
    if (!slot || slot.enabled === false) return null
    return {
      title: localize(locale, slot.title),
      subtitle: localize(locale, slot.subtitle),
      ctaLabel: localize(locale, slot.ctaLabel),
      href: slot.href,
      imageUrl: slot.imageUrl,
    }
  }, [cmsHome?.marketing?.featuredSlot, locale, rails.bundles])

  const brandSpotlights = useMemo(() => {
    const sections =
      cmsHome?.marketing?.brandSpotlights && cmsHome.marketing.brandSpotlights.length > 0
        ? cmsHome.marketing.brandSpotlights
        : (cmsHome?.marketing?.brandSections ?? [])

    return sections
      .filter((section) => section.enabled ?? true)
      .map((section) => ({
        id: section.id,
        bannerTitle: localize(locale, section.bannerTitle),
        bannerSubtitle: localize(locale, section.bannerSubtitle),
        bannerCtaLabel: localize(locale, section.bannerCtaLabel),
        bannerHref: section.bannerHref,
        bannerImageUrl: section.bannerImageUrl,
        railTitle: localize(locale, section.railTitle),
        items: resolveRailProducts(products, section.query).map((item) => ({
          ...toHomeProductItem(item),
          urgencyLabel: resolveProductCardUrgency(item),
        })),
      }))
  }, [cmsHome?.marketing?.brandSections, cmsHome?.marketing?.brandSpotlights, locale, products])
  const primaryBrandSpotlight = brandSpotlights[0] ?? null

  const educationBanner = useMemo<HomeEducationBanner | null>(() => {
    const banner = cmsHome?.marketing?.educationBanner
    if (banner?.enabled !== false && banner?.title) {
      return {
        id: 'education-banner',
        title: localize(locale, banner.title),
        subtitle: localize(locale, banner.subtitle),
        ctaLabel: localize(locale, banner.ctaLabel),
        href: banner.href,
        imageUrl: banner.imageUrl,
      }
    }

    if (inlineCampaign) {
      return {
        id: inlineCampaign.id,
        title: inlineCampaign.title,
        subtitle: inlineCampaign.subtitle,
        ctaLabel: inlineCampaign.ctaLabel,
        href: inlineCampaign.href,
        imageUrl: inlineCampaign.imageUrl,
      }
    }

    return {
      id: 'education-banner-default',
      title: locale === 'ar' ? 'ابحثي عن روتينك المثالي' : 'Find Your Perfect Routine',
      subtitle: locale === 'ar' ? 'اختبار سريع لروتينك اليومي' : 'Take a quick skin test for your routine.',
      ctaLabel: locale === 'ar' ? 'ابدأ الاختبار' : 'Take Test',
      href: '/shop',
    }
  }, [cmsHome?.marketing?.educationBanner, inlineCampaign, locale])

  const topBrands = useMemo(() => {
    const brands = cmsHome?.marketing?.brands ?? []
    return brands.slice(0, 8).map((item): HomeBrandItem => ({
      id: item.id,
      name: item.name,
      href: item.href,
      logoUrl: item.logoUrl,
    }))
  }, [cmsHome?.marketing?.brands])

  const topBrandsTitle = useMemo(() => localize(locale, cmsHome?.marketing?.topBrandsTitle), [cmsHome?.marketing?.topBrandsTitle, locale])

  const ugcSection = useMemo(() => {
    const ugc = cmsHome?.marketing?.ugcGallery
    if (ugc?.enabled !== false && ugc?.items?.length) {
      return {
        title: localize(locale, ugc.title) || (locale === 'ar' ? 'إطلالات من مجتمعنا' : 'Looks From Our Community'),
        items: ugc.items.map((item): HomeUgcItem => ({
          id: item.id,
          imageUrl: item.imageUrl,
          productId: item.productId,
          caption: localize(locale, item.caption),
          href: item.href,
        })),
      }
    }

    const fallbackItems = products
      .filter((item) => Boolean(item.image))
      .slice(0, 10)
      .map((item): HomeUgcItem => ({
        id: `ugc-${item.id}`,
        imageUrl: item.image || '/brand-logo-placeholder.svg',
        productId: item.id,
        caption: `${deriveBrand(item)} • ${deriveProductName(item)}`,
      }))

    return {
      title: locale === 'ar' ? 'إطلالات من مجتمعنا' : 'Looks From Our Community',
      items: fallbackItems,
    }
  }, [cmsHome?.marketing?.ugcGallery, locale, products])

  const newsletterCta = useMemo<HomeNewsletterCta | null>(() => {
    const cta = cmsHome?.marketing?.newsletterCta
    if (cta?.enabled !== false && cta?.title) {
      return {
        title: localize(locale, cta.title),
        subtitle: localize(locale, cta.subtitle),
        ctaLabel: localize(locale, cta.ctaLabel),
        href: cta.href,
      }
    }

    const shellTitle = cmsHome?.shell?.footer?.newsletterTitle
    if (!shellTitle) {
      return {
        title: locale === 'ar' ? 'انضم لبرنامج المكافآت' : 'Join our rewards program',
        subtitle:
          locale === 'ar'
            ? 'اكسب نقاطاً مع كل طلب واحصل على عروض حصرية.'
            : 'Earn points on every order and unlock exclusive offers.',
        ctaLabel: locale === 'ar' ? 'اشترك الآن' : 'Subscribe',
      }
    }

    return {
      title: localize(locale, shellTitle),
      subtitle: localize(locale, cmsHome?.shell?.footer?.newsletterSubtitle),
      ctaLabel: locale === 'ar' ? 'اشترك' : 'Subscribe',
    }
  }, [cmsHome?.marketing?.newsletterCta, cmsHome?.shell?.footer, locale])

  return (
    <HomeV2Sections
      heroItems={heroItems}
      tickerItems={tickerItems}
      bestSellersRail={rails.bestSellers}
      trendingRail={rails.trending}
      bundlesRail={rails.bundles}
      newArrivalsRail={rails.newArrivals}
      communityFavoritesRail={rails.communityFavorites}
      personalizedRail={personalizedRail}
      featuredSlot={featuredSlot}
      spotlight={primaryBrandSpotlight}
      educationBanner={educationBanner}
      topBrandsTitle={topBrandsTitle}
      topBrands={topBrands}
      ugcTitle={ugcSection.title}
      ugcItems={ugcSection.items}
      newsletterCta={newsletterCta}
      flashSale={flashSale}
      campaignAnchor2={campaignAnchor2}
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

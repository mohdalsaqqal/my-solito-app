import { useMemo } from 'react'
import { Platform, ScrollView } from 'react-native'
import { resolveMarketingCampaign } from '@real/app/lib/campaigns'
import { HomeV2Sections } from '@real/app/sections/home/HomeV2Sections'
import { CMSHome, Product } from '@real/app/lib/types'
import {
  HomeBrandItem,
  HomeCategoryItem,
  HomeEducationBanner,
  HomeEditorialHotspotSection,
  HomeNewsletterCta,
  HomeProductItem,
  HomeUgcItem,
} from '@real/ui/components/home/types'
import { applyProductFilter } from '@real/app/lib/product-filter'
import {
  buildHomeProductItem,
  resolveRealProductCardUrgency,
} from '@real/app/lib/product-card-presentation'

const HomeV2SectionsAny = HomeV2Sections as any

type HomeV2ScreenProps = {
  cmsHome?: CMSHome | null
  products: Product[]
  brands: Array<{
    id: string
    slug: string
    name: { en: string; ar: string }
    logo?: string
    description?: { en: string; ar: string }
    isActive: boolean
  }>
  categories: Array<{
    id: string
    slug: string
    name: { en: string; ar: string }
    parentId?: string
    image?: string
    isActive: boolean
    sortOrder: number
  }>
  loading: boolean
  error: string | null
  onReload: () => void
  locale?: 'en' | 'ar'
  onNavigate?: (href: string) => void
  onSelectProduct?: (productId: string) => void
  onQuickView?: (item: HomeProductItem) => void
  onAddToCart?: (productId: string) => void
  onAddAllToCart?: (productIds: string[]) => void
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

function toBrandSlug(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, '-')
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
  brands,
  categories,
  loading,
  error,
  onReload,
  locale = 'en',
  onNavigate,
  onSelectProduct,
  onQuickView,
  onAddToCart,
  onAddAllToCart,
}: HomeV2ScreenProps) {
  const publishedHomeBlocks = cmsHome?.page?.blocks ?? null
  const hasPublishedHomeBlocks = (publishedHomeBlocks?.length ?? 0) > 0

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
    return resolveRealProductCardUrgency(product, locale, {
      lowStockThreshold: productCardLowStockThreshold,
      lowStockLabel: productCardLowStockLabel,
      includeLimitedRelease: productCardUrgency !== undefined,
    })
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
        ...buildHomeProductItem(item, locale),
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
          ...buildHomeProductItem(item, locale),
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
        ...buildHomeProductItem(item, locale),
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

  const productBrandCounts = useMemo(() => {
    return products.reduce<Record<string, number>>((accumulator, product) => {
      const key = product.brand?.trim().toLowerCase()
      if (!key) return accumulator
      accumulator[key] = (accumulator[key] ?? 0) + 1
      return accumulator
    }, {})
  }, [products])

  const productBrandImages = useMemo(() => {
    return products.reduce<Record<string, string>>((accumulator, product) => {
      const key = product.brand?.trim().toLowerCase()
      if (!key || accumulator[key] || !product.image) return accumulator
      accumulator[key] = product.image
      return accumulator
    }, {})
  }, [products])

  const topBrands = useMemo(() => {
    const cmsBrands = (cmsHome?.marketing?.brands ?? []).slice(0, 8).map((item): HomeBrandItem => ({
      id: item.id,
      name: item.name,
      href: item.href,
      logoUrl: item.logoUrl,
    }))

    const catalogBrands = brands
      .filter((brand) => brand.isActive)
      .map((brand) => ({
        id: brand.id,
        slug: brand.slug,
        name: localize(locale, brand.name, brand.slug),
        href: `/shop?brands=${brand.slug}`,
        logoUrl: brand.logo || productBrandImages[brand.slug],
        productCount: productBrandCounts[brand.slug] ?? 0,
      }))
      .filter((brand) => brand.productCount > 0)
      .sort((left, right) => right.productCount - left.productCount || left.name.localeCompare(right.name))
      .slice(0, 8)
      .map<HomeBrandItem>(({ id, name, href, logoUrl }) => ({
        id,
        name,
        href,
        logoUrl,
      }))

    const mergedBrands = [...cmsBrands]
    const seenKeys = new Set(
      cmsBrands.map((brand) => brand.href || brand.name.trim().toLowerCase().replace(/\s+/g, '-')),
    )

    for (const brand of catalogBrands) {
      const brandKey = brand.href || brand.name.trim().toLowerCase().replace(/\s+/g, '-')
      if (seenKeys.has(brandKey)) continue
      mergedBrands.push(brand)
      seenKeys.add(brandKey)
      if (mergedBrands.length >= 8) break
    }

    return mergedBrands.slice(0, 8)
  }, [brands, cmsHome?.marketing?.brands, locale, productBrandCounts, productBrandImages])

  const brandSpotlights = useMemo(() => {
    const sections =
      cmsHome?.marketing?.brandSpotlights && cmsHome.marketing.brandSpotlights.length > 0
        ? cmsHome.marketing.brandSpotlights
        : (cmsHome?.marketing?.brandSections ?? [])

    const resolvedSections = sections
      .filter((section) => section.enabled ?? true)
      .map((section) => {
        const selectedBrandName = section.query?.brandNames?.map((item) => item.trim()).find(Boolean)
        const spotlightItems = resolveRailProducts(products, {
          ...section.query,
          brandNames: selectedBrandName ? [selectedBrandName] : section.query?.brandNames,
        }).map((item) => ({
          ...buildHomeProductItem(item, locale),
          urgencyLabel: resolveProductCardUrgency(item),
        }))
        const brandHref = selectedBrandName ? `/shop?brands=${toBrandSlug(selectedBrandName)}` : section.bannerHref
        return {
          id: section.id,
          bannerTitle: localize(locale, section.bannerTitle),
          bannerSubtitle: localize(locale, section.bannerSubtitle),
          bannerCtaLabel: localize(locale, section.bannerCtaLabel),
          bannerHref: brandHref,
          bannerImageUrl: section.bannerImageUrl ?? spotlightItems[0]?.imageUrl,
          railTitle: localize(locale, section.railTitle),
          items: spotlightItems,
        }
      })
      .filter((section) => section.items.length > 0)

    if (resolvedSections.length > 0) {
      return resolvedSections
    }

    return topBrands.slice(0, 2).map((brand, index) => {
      const slug = brand.href?.split('brands=')[1] ?? ''
      const brandProducts = resolveRailProducts(products, {
        brandNames: slug ? [slug] : [brand.name],
        limit: 12,
      }).map((item) => ({
        ...buildHomeProductItem(item, locale),
        urgencyLabel: resolveProductCardUrgency(item),
      }))

      const leadProduct = brandProducts[0]
      return {
        id: `fallback-brand-spotlight-${index + 1}`,
        bannerTitle: locale === 'ar' ? `${brand.name} المختارة` : `${brand.name} Spotlight`,
        bannerSubtitle:
          locale === 'ar'
            ? 'تسوقي أفضل المنتجات من هذه العلامة.'
            : 'Shop the best-performing products from this brand.',
        bannerCtaLabel: locale === 'ar' ? 'تسوقي العلامة' : 'Shop Brand',
        bannerHref: brand.href ?? '/shop',
        bannerImageUrl: leadProduct?.imageUrl,
        railTitle: locale === 'ar' ? `منتجات ${brand.name}` : `${brand.name} Picks`,
        items: brandProducts,
      }
    }).filter((section) => section.items.length > 0)
  }, [cmsHome?.marketing?.brandSections, cmsHome?.marketing?.brandSpotlights, locale, products, topBrands])
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

  const offerBanners = useMemo(
    () =>
      cmsHome?.marketing?.offerBanners
        ?.filter((b) => b.enabled !== false)
        .map((b) => ({
          id: b.id,
          imageUrl: b.imageUrl,
          href: b.href,
          title: b.title ? localize(locale, b.title) : undefined,
          subtitle: b.subtitle ? localize(locale, b.subtitle) : undefined,
          ctaLabel: b.ctaLabel ? localize(locale, b.ctaLabel) : undefined,
        })) ?? null,
    [cmsHome?.marketing?.offerBanners, locale],
  )

  const editorialHotspotSection = useMemo<HomeEditorialHotspotSection | null>(() => {
    const section = cmsHome?.marketing?.editorialHotspotSection
    if (section?.enabled === false || !section?.imageUrl) {
      return null
    }

    const productById = new Map(products.map((product) => [product.id, product]))
    const seenProductIds = new Set<string>()
    const hotspots = (section.hotspots ?? [])
      .map((hotspot) => {
        const product = productById.get(hotspot.productId)
        if (!product) return null
        return {
          id: hotspot.id,
          productId: product.id,
          xPercent: hotspot.xPercent,
          yPercent: hotspot.yPercent,
          label: localize(locale, hotspot.label) || undefined,
        }
      })
      .filter((hotspot): hotspot is HomeEditorialHotspotSection['hotspots'][number] => Boolean(hotspot))

    const orderedProductIds = section.productIds?.length
      ? section.productIds
      : hotspots.map((hotspot) => hotspot.productId)

    const productsForSection: HomeProductItem[] = []
    for (const productId of orderedProductIds.slice(0, 4)) {
      if (seenProductIds.has(productId)) continue
      const rawProduct = productById.get(productId)
      if (!rawProduct) continue
      productsForSection.push({
        ...buildHomeProductItem(rawProduct, locale),
        urgencyLabel: resolveProductCardUrgency(rawProduct),
      })
      seenProductIds.add(productId)
    }

    if (productsForSection.length === 0) {
      return null
    }

    return {
      id: section.id,
      title: localize(locale, section.title) || undefined,
      subtitle: localize(locale, section.subtitle) || undefined,
      ctaLabel: localize(locale, section.ctaLabel) || undefined,
      href: section.href,
      imageUrl: section.imageUrl,
      hotspots,
      products: productsForSection,
    }
  }, [cmsHome?.marketing?.editorialHotspotSection, locale, products])

  const topBrandsTitle = useMemo(() => localize(locale, cmsHome?.marketing?.topBrandsTitle), [cmsHome?.marketing?.topBrandsTitle, locale])

  const categoryItems = useMemo<HomeCategoryItem[]>(() => {
    const productCounts = products.reduce<Record<string, number>>((accumulator, product) => {
      const key = product.category?.trim().toLowerCase()
      if (!key) return accumulator
      accumulator[key] = (accumulator[key] ?? 0) + 1
      return accumulator
    }, {})

    const categoryImages = products.reduce<Record<string, string>>((accumulator, product) => {
      const key = product.category?.trim().toLowerCase()
      if (!key || accumulator[key] || !product.image) {
        return accumulator
      }
      accumulator[key] = product.image
      return accumulator
    }, {})

    const primaryCategories = categories
      .filter((category) => category.isActive)
      .filter((category) => !category.parentId)
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map((category) => ({
        id: category.id,
        label: localize(locale, category.name, category.slug),
        href: `/shop/categories/${category.slug}`,
        itemCount: productCounts[category.slug.toLowerCase()] ?? 0,
        imageUrl: category.image || categoryImages[category.slug.toLowerCase()],
      }))

    if (primaryCategories.length > 0) {
      return primaryCategories
    }

    const fallback = [...new Set(products.map((product) => product.category).filter(Boolean))]
      .sort()
      .map((category) => ({
        id: `fallback-${category}`,
        label: category!.charAt(0).toUpperCase() + category!.slice(1),
        href: `/shop/categories/${category}`,
        itemCount: productCounts[category!.toLowerCase()] ?? 0,
        imageUrl: categoryImages[category!.toLowerCase()],
      }))

    return fallback
  }, [categories, locale, products])

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
      .map((item): HomeUgcItem => {
        const productCardItem = buildHomeProductItem(item, locale)
        return {
          id: `ugc-${item.id}`,
          imageUrl: item.image || '/brand-logo-placeholder.svg',
          productId: item.id,
          caption: `${productCardItem.brand} • ${productCardItem.displayTitle ?? productCardItem.name}`,
        }
      })

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

  const homeSections = hasPublishedHomeBlocks ? (
    <HomeV2SectionsAny
      homeBlocks={publishedHomeBlocks}
      tickerItems={tickerItems}
      loading={loading}
      error={error}
      tickerSpeedMs={cmsHome?.marketing?.ticker?.speedMs ?? 22000}
      heroAutoplay={cmsHome?.marketing?.hero?.autoplay ?? true}
      heroAutoplayMs={cmsHome?.marketing?.hero?.autoplayMs ?? 4200}
      railAutoplay={{
        hero: {
          enabled: cmsHome?.marketing?.railAutoplay?.hero?.enabled ?? cmsHome?.marketing?.hero?.autoplay ?? true,
          autoplayMs: cmsHome?.marketing?.railAutoplay?.hero?.autoplayMs ?? cmsHome?.marketing?.hero?.autoplayMs ?? 4200,
        },
        categories: {
          enabled: cmsHome?.marketing?.railAutoplay?.categories?.enabled ?? false,
          autoplayMs: cmsHome?.marketing?.railAutoplay?.categories?.autoplayMs ?? 5200,
        },
        newArrivals: {
          enabled: cmsHome?.marketing?.railAutoplay?.newArrivals?.enabled ?? false,
          autoplayMs: cmsHome?.marketing?.railAutoplay?.newArrivals?.autoplayMs ?? 4800,
        },
        featured: {
          enabled: cmsHome?.marketing?.railAutoplay?.featured?.enabled ?? false,
          autoplayMs: cmsHome?.marketing?.railAutoplay?.featured?.autoplayMs ?? 5000,
        },
        brandSpotlights: {
          enabled: cmsHome?.marketing?.railAutoplay?.brandSpotlights?.enabled ?? false,
          autoplayMs: cmsHome?.marketing?.railAutoplay?.brandSpotlights?.autoplayMs ?? 5200,
        },
      }}
      locale={locale}
      onReload={onReload}
      onNavigate={onNavigate}
      onSelectProduct={onSelectProduct}
      onQuickView={onQuickView}
      onAddToCart={onAddToCart}
      onAddAllToCart={onAddAllToCart}
    />
  ) : (
    <HomeV2SectionsAny
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
      brandSpotlights={brandSpotlights}
      educationBanner={educationBanner}
      offerBanners={offerBanners}
      editorialHotspotSection={editorialHotspotSection}
      topBrandsTitle={topBrandsTitle}
      topBrands={topBrands}
      categoryItems={categoryItems}
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
      railAutoplay={{
        hero: {
          enabled: cmsHome?.marketing?.railAutoplay?.hero?.enabled ?? cmsHome?.marketing?.hero?.autoplay ?? true,
          autoplayMs: cmsHome?.marketing?.railAutoplay?.hero?.autoplayMs ?? cmsHome?.marketing?.hero?.autoplayMs ?? 4200,
        },
        categories: {
          enabled: cmsHome?.marketing?.railAutoplay?.categories?.enabled ?? false,
          autoplayMs: cmsHome?.marketing?.railAutoplay?.categories?.autoplayMs ?? 5200,
        },
        newArrivals: {
          enabled: cmsHome?.marketing?.railAutoplay?.newArrivals?.enabled ?? false,
          autoplayMs: cmsHome?.marketing?.railAutoplay?.newArrivals?.autoplayMs ?? 4800,
        },
        featured: {
          enabled: cmsHome?.marketing?.railAutoplay?.featured?.enabled ?? false,
          autoplayMs: cmsHome?.marketing?.railAutoplay?.featured?.autoplayMs ?? 5000,
        },
        brandSpotlights: {
          enabled: cmsHome?.marketing?.railAutoplay?.brandSpotlights?.enabled ?? false,
          autoplayMs: cmsHome?.marketing?.railAutoplay?.brandSpotlights?.autoplayMs ?? 5200,
        },
      }}
      locale={locale}
      onReload={onReload}
      onNavigate={onNavigate}
      onSelectProduct={onSelectProduct}
      onQuickView={onQuickView}
      onAddToCart={onAddToCart}
      onAddAllToCart={onAddAllToCart}
    />
  )

  if (Platform.OS !== 'web') {
    return (
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {homeSections}
      </ScrollView>
    )
  }

  return homeSections
}

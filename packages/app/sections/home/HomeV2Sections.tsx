import { Fragment, useEffect, useMemo, useState } from 'react'
import { Platform, useWindowDimensions } from 'react-native'
import { localizeString } from '@real/app/lib/cms/blocks'
import type { LocalizedString, Product } from '@real/app/lib/types'
import { BlockRenderer } from '@real/app/sections/blocks/BlockRenderer'
import type { RegisteredHomePageBlock } from '@real/app/sections/blocks/block-types'
import { breakpoints, colors, componentTokens, layout, spacing } from '@real/tokens'
import { Box } from '@real/ui/primitives'
import {
  AnnouncementTicker,
  BrandSpotlightPanel,
  BrandSpotlightSection,
  CategoryRail,
  EditorialHotspotSection,
  FlashSaleBand,
  HeroTileRail,
  HomeHeroRail,
  NewsletterLoyaltyCta,
  OfferBannersGrid,
  ProductRail,
  TestimonialsBlock,
  TopBrandsGrid,
} from '@real/ui/components'
import type { OfferBannerBlock } from '@real/ui/components'
import {
  HomeBrandItem,
  HomeCategoryItem,
  HomeEducationBanner,
  HomeEditorialHotspotSection,
  HomeHeroItem,
  HomeNewsletterCta,
  HomeProductItem,
  HomeUgcItem,
} from '@real/ui/components/home/types'

// ─── Types ────────────────────────────────────────────────────────────────────

type ResolvedRail = {
  id: string
  title: string
  items: HomeProductItem[]
}

type FeaturedSlot = {
  title: string
  subtitle?: string
  ctaLabel?: string
  href?: string
  imageUrl?: string
}

type SpotlightSection = {
  id: string
  bannerTitle: string
  bannerSubtitle?: string
  bannerCtaLabel?: string
  bannerHref?: string
  bannerImageUrl?: string
  railTitle: string
  items: HomeProductItem[]
}

type TickerItem = {
  id: string
  label: string
  href?: string
}

type RailAutoplaySetting = {
  enabled?: boolean
  autoplayMs?: number
}

type HomeRailAutoplaySettings = {
  hero?: RailAutoplaySetting
  categories?: RailAutoplaySetting
  newArrivals?: RailAutoplaySetting
  featured?: RailAutoplaySetting
  brandSpotlights?: RailAutoplaySetting
}

type PublishedHomeBlock = RegisteredHomePageBlock['props']

function resolveBlockString(block: PublishedHomeBlock, value: string | LocalizedString | undefined, fallback = '') {
  if (!value) return fallback
  if (typeof value === 'string') return value
  return localizeString(value, block.locale, fallback)
}

function resolvePairString(
  locale: PublishedHomeBlock['locale'],
  valueEn?: string,
  valueAr?: string,
  fallback = '',
) {
  if (locale === 'ar') return valueAr || valueEn || fallback
  return valueEn || valueAr || fallback
}

function mapProductToHomeItem(product: Product): HomeProductItem {
  return {
    id: product.id,
    name: product.name,
    brand: product.brand ?? '',
    price: product.price,
    currency: product.currency,
    imageUrl: product.image,
    href: `/product/${product.id}`,
    rating: product.rating,
    reviews: product.reviews,
    isNew: product.isNew,
    isLimited: product.isLimited,
    stock: product.stock,
    displayTitle: product.name,
  }
}

function mapProductsToHomeItems(products: Product[]) {
  return products.map(mapProductToHomeItem)
}

function mapBrandItems(
  items: Array<{
    id: string
    name: string
    href?: string
    logoUrl?: string
  }>,
) {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    href: item.href,
    logoUrl: item.logoUrl,
  }))
}

function mapCategoryItems(
  block: PublishedHomeBlock,
  items: Array<{
    id: string
    label: string | LocalizedString
    href?: string
    imageUrl?: string
  }>,
) {
  return items.map((item) => ({
    id: item.id,
    label: resolveBlockString(block, item.label),
    href: item.href,
    imageUrl: item.imageUrl,
  }))
}

function mapHeroItems(block: PublishedHomeBlock) {
  if (block.type === 'hero_carousel') {
    const cards = block.cardsLocalized ?? block.cards
    return cards.map((card) => ({
      id: card.id,
      title: 'titleText' in card && card.titleText ? card.titleText : resolvePairString(block.locale, card.titleEn, card.titleAr),
      subtitle:
        'subtitleText' in card && card.subtitleText
          ? card.subtitleText
          : resolvePairString(block.locale, card.subtitleEn, card.subtitleAr),
      ctaLabel:
        'ctaText' in card && card.ctaText ? card.ctaText : resolvePairString(block.locale, card.ctaLabelEn, card.ctaLabelAr),
      href: card.href,
      imageUrl: card.imageUrl,
      badgeLabel:
        'badgeText' in card && card.badgeText ? card.badgeText : resolvePairString(block.locale, card.badgeLabelEn, card.badgeLabelAr),
    }))
  }

  if (block.type === 'hero') {
    return [
      {
        id: block.id,
        title: resolveBlockString(block, block.title),
        subtitle: resolveBlockString(block, block.subtitle),
        ctaLabel: resolveBlockString(block, block.ctaLabel),
        href: block.href,
        imageUrl: block.imageUrl,
      },
    ]
  }

  return []
}

function mapOfferBannerBlocks(
  block: PublishedHomeBlock,
  items: Array<
    | {
        id: string
        title?: string | LocalizedString
        subtitle?: string | LocalizedString
        ctaLabel?: string | LocalizedString
        ctaText?: string | LocalizedString
        ctaLabelEn?: string
        ctaLabelAr?: string
        href?: string
        imageUrl?: string
      }
    | {
        id: string
        badge?: string | LocalizedString
        title: string | LocalizedString
        subtitle?: string | LocalizedString
        href?: string
      }
  >,
): OfferBannerBlock[] {
  return items.map((item) => ({
    id: item.id,
    title: 'title' in item ? resolveBlockString(block, item.title) : undefined,
    subtitle: resolveBlockString(block, item.subtitle),
    ctaLabel:
      'ctaLabel' in item
        ? resolveBlockString(block, item.ctaLabel)
        : 'ctaText' in item
          ? resolveBlockString(block, item.ctaText)
          : 'ctaLabelEn' in item || 'ctaLabelAr' in item
            ? resolvePairString(block.locale, item.ctaLabelEn, item.ctaLabelAr)
            : undefined,
    href: item.href,
    imageUrl: 'imageUrl' in item ? item.imageUrl : undefined,
  }))
}

type HomeV2SectionsProps = {
  homeBlocks?: RegisteredHomePageBlock[] | null
  heroItems?: HomeHeroItem[]
  tickerItems?: TickerItem[]
  bestSellersRail?: ResolvedRail | null
  trendingRail?: ResolvedRail | null
  bundlesRail?: ResolvedRail | null
  newArrivalsRail?: ResolvedRail | null
  communityFavoritesRail?: ResolvedRail | null
  personalizedRail?: ResolvedRail | null
  featuredSlot?: FeaturedSlot | null
  spotlight?: SpotlightSection | null
  brandSpotlights?: SpotlightSection[]
  educationBanner?: HomeEducationBanner | null
  offerBanners?: Array<{ id: string; imageUrl?: string; href?: string; ctaLabel?: string; title?: string; subtitle?: string }> | null
  topBrandsTitle?: string
  topBrands?: HomeBrandItem[]
  categoryItems?: HomeCategoryItem[]
  editorialHotspotSection?: HomeEditorialHotspotSection | null
  ugcTitle?: string
  ugcItems?: HomeUgcItem[]
  newsletterCta?: HomeNewsletterCta | null
  flashSale?: {
    offerText: string
    preLabel: string
    postLabel: string
    endsAtIso?: string
    ctaLabel?: string
  } | null
  campaignAnchor2?: {
    headline: string
    preHeadline?: string
    subline?: string
    badgeLabel?: string
    ctaLabel?: string
    imageUrl?: string
    href?: string
  } | null
  loading: boolean
  error: string | null
  tickerSpeedMs: number
  heroAutoplay: boolean
  heroAutoplayMs: number
  railAutoplay?: HomeRailAutoplaySettings
  locale?: 'en' | 'ar'
  onReload: () => void
  onNavigate?: (href: string) => void
  onSelectProduct?: (productId: string) => void
  onQuickView?: (item: HomeProductItem) => void
  onAddToCart?: (productId: string) => void
  onAddAllToCart?: (productIds: string[]) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function HomeV2Sections({
  homeBlocks = null,
  heroItems = [],
  tickerItems = [],
  bestSellersRail = null,
  trendingRail = null,
  bundlesRail = null,
  newArrivalsRail = null,
  communityFavoritesRail = null,
  personalizedRail = null,
  featuredSlot = null,
  spotlight = null,
  brandSpotlights = [],
  educationBanner = null,
  offerBanners,
  topBrands = [],
  categoryItems = [],
  editorialHotspotSection = null,
  ugcItems = [],
  newsletterCta = null,
  flashSale = null,
  campaignAnchor2 = null,
  loading,
  error,
  tickerSpeedMs,
  heroAutoplay,
  heroAutoplayMs,
  railAutoplay,
  locale = 'en',
  onReload,
  onNavigate,
  onSelectProduct,
  onQuickView,
  onAddToCart,
  onAddAllToCart,
}: HomeV2SectionsProps) {
  const { width } = useWindowDimensions()
  const [hasHydrated, setHasHydrated] = useState(Platform.OS !== 'web')
  const layoutTokens = componentTokens.storefrontHome.layout

  useEffect(() => {
    if (Platform.OS === 'web') setHasHydrated(true)
  }, [])

  const effectiveWidth = Platform.OS === 'web' && !hasHydrated ? 0 : width
  const viewportWidth = effectiveWidth || layout.containerMaxWidth
  const isDesktop = viewportWidth >= breakpoints.desktopMin || (Platform.OS === 'web' && effectiveWidth === 0)
  const orderedHomeBlocks = useMemo(
    () =>
      homeBlocks && homeBlocks.length > 0
        ? [...homeBlocks].sort((left, right) => left.position - right.position)
        : null,
    [homeBlocks],
  )

  // ── Rail resolution ──────────────────────────────────────────────────────
  // Primary: new arrivals preferred; fallback chain
  const primaryRail = newArrivalsRail ?? trendingRail ?? bundlesRail ?? personalizedRail ?? communityFavoritesRail ?? bestSellersRail
  // Secondary: best sellers preferred, must differ from primary
  const secondaryRail = (() => {
    const candidates = [bestSellersRail, communityFavoritesRail, trendingRail, personalizedRail, newArrivalsRail]
    return candidates.find((r) => r && r.id !== primaryRail?.id) ?? null
  })()

  // ── Promo blocks for hero tiles and offer banners ────────────────────────
  const promoBlocks: OfferBannerBlock[] = offerBanners
    ? offerBanners.map((b) => ({
        title: b.title ?? '',
        subtitle: b.subtitle,
        ctaLabel: b.ctaLabel,
        href: b.href,
        imageUrl: b.imageUrl,
      }))
    : [
        featuredSlot?.imageUrl ? featuredSlot : null,
        campaignAnchor2?.imageUrl
          ? {
              title: campaignAnchor2.headline,
              subtitle: campaignAnchor2.subline,
              ctaLabel: campaignAnchor2.ctaLabel,
              href: campaignAnchor2.href,
              imageUrl: campaignAnchor2.imageUrl,
            }
          : null,
        educationBanner?.imageUrl ? educationBanner : null,
      ].filter((b): b is NonNullable<typeof b> => Boolean(b))

  // ── Showcase image for brand spotlight panel ─────────────────────────────
  const showcaseImageUrl =
    promoBlocks[0]?.imageUrl ??
    heroItems[0]?.imageUrl ??
    ugcItems[0]?.imageUrl

  if (orderedHomeBlocks && orderedHomeBlocks.length > 0) {
    return (
      <Box
        style={{
          width: '100%',
          gap: layoutTokens.rootGap,
          backgroundColor: colors.background,
        }}
      >
        {orderedHomeBlocks.map((block) => (
          <Fragment key={block.id}>
            <BlockRenderer
              block={block}
              isDesktop={isDesktop}
              tickerSpeedMs={tickerSpeedMs}
              loading={loading}
              error={error}
              railAutoplay={railAutoplay}
              locale={locale}
              onReload={onReload}
              onNavigate={onNavigate}
              onSelectProduct={onSelectProduct}
              onQuickView={onQuickView}
              onAddToCart={onAddToCart}
              onAddAllToCart={onAddAllToCart}
            />
          </Fragment>
        ))}
      </Box>
    )
  }

  return (
    <Box
      style={{
        width: '100%',
        gap: layoutTokens.rootGap,
        backgroundColor: colors.background,
      }}
    >
      {/* 1. Announcement ticker */}
      {tickerItems.length > 0 && (
        <AnnouncementTicker
          items={tickerItems}
          speedMs={tickerSpeedMs}
          onPressItem={(href) => (href ? onNavigate?.(href) : undefined)}
        />
      )}

      {/* 2. Flash sale band */}
      {flashSale && (
        <FlashSaleBand
          offerText={flashSale.offerText}
          preLabel={flashSale.preLabel}
          postLabel={flashSale.postLabel}
          endsAtIso={flashSale.endsAtIso}
          ctaLabel={flashSale.ctaLabel}
        />
      )}

      {/* 3. Editorial hero tile rail (with promo blocks merged in) */}
      {heroItems.length > 0 && (
        <HeroTileRail
          heroItems={heroItems}
          promoBlocks={promoBlocks
            .filter((block): block is OfferBannerBlock & { title: string } => typeof block.title === 'string' && block.title.length > 0)
            .slice(0, 3)}
          autoplay={heroAutoplay}
          autoplayMs={heroAutoplayMs}
          onNavigate={onNavigate}
        />
      )}

      {/* 4. Category rail */}
      {categoryItems.length > 0 && (
        <CategoryRail
          items={categoryItems}
          autoplay={railAutoplay?.categories?.enabled}
          autoplayMs={railAutoplay?.categories?.autoplayMs}
          onPressItem={(item) => onNavigate?.(item.href ?? '/shop')}
        />
      )}

      {/* 5. Primary product rail (New Arrivals) with filter chips */}
      {primaryRail && (
        <ProductRail
          title={primaryRail.title}
          actionLabel='Shop All'
          actionHref='/shop'
          items={primaryRail.items}
          showFilterChips
          autoplay={railAutoplay?.newArrivals?.enabled}
          autoplayMs={railAutoplay?.newArrivals?.autoplayMs}
          loading={loading}
          error={error}
          onRetry={onReload}
          onPressAction={() => onNavigate?.('/shop')}
          onSelectProduct={onSelectProduct}
          onQuickView={onQuickView}
          onAddToCart={onAddToCart}
        />
      )}

      {/* 6. Today's deals / offer banners */}
      {promoBlocks.length > 0 && (
        <OfferBannersGrid
          title="Today's Deals"
          actionLabel='Shop deals'
          blocks={promoBlocks}
          isDesktop={isDesktop}
          onNavigate={onNavigate}
          onPressAction={() => onNavigate?.('/shop')}
        />
      )}

      {/* 7. Editorial hotspot section */}
      {editorialHotspotSection && (
        <Box
          style={{
            width: '100%',
            maxWidth: layout.containerMaxWidth,
            alignSelf: 'center',
            paddingHorizontal: isDesktop
              ? componentTokens.storefrontHome.contentPaddingXDesktop
              : componentTokens.storefrontHome.contentPaddingXMobile,
          }}
        >
          <EditorialHotspotSection
            section={editorialHotspotSection}
            onNavigate={onNavigate}
            onSelectProduct={onSelectProduct}
            onAddToCart={onAddToCart}
            onAddAllToCart={onAddAllToCart}
            addAllToCartLabel={locale === 'ar' ? 'أضف الكل إلى السلة' : 'Add all to cart'}
          />
        </Box>
      )}

      {/* 8. Brand spotlight panel (showcase image + trending brands hall) */}
      {(showcaseImageUrl || topBrands.length > 0) && (
        <BrandSpotlightPanel
          showcaseImageUrl={showcaseImageUrl}
          featureTitle={topBrands[0] ? `${topBrands[0].name} beauty spotlight` : undefined}
          featureCtaLabel='Shop now'
          featureHref='/shop'
          brands={topBrands}
          isDesktop={isDesktop}
          onNavigate={onNavigate}
        />
      )}

      {/* 9. Secondary product rail (Best Sellers / Featured) */}
      {secondaryRail && (
        <ProductRail
          title={secondaryRail.title}
          actionLabel='Shop All'
          actionHref='/shop'
          items={secondaryRail.items}
          showFilterChips
          autoplay={railAutoplay?.featured?.enabled}
          autoplayMs={railAutoplay?.featured?.autoplayMs}
          loading={loading}
          error={error}
          onRetry={onReload}
          onPressAction={() => onNavigate?.('/shop')}
          onSelectProduct={onSelectProduct}
          onQuickView={onQuickView}
          onAddToCart={onAddToCart}
        />
      )}

      {/* 10. Brand spotlight rail sections (brand banner + product rail) */}
      {brandSpotlights
        .filter((s) => (s.items?.length ?? 0) > 0)
        .slice(0, 2)
        .map((spot) => (
          <BrandSpotlightSection
            key={spot.id}
            id={spot.id}
            bannerTitle={spot.bannerTitle}
            bannerSubtitle={spot.bannerSubtitle}
            bannerCtaLabel={spot.bannerCtaLabel}
            bannerHref={spot.bannerHref}
            bannerImageUrl={spot.bannerImageUrl}
            railTitle={spot.railTitle}
            items={spot.items}
            loading={loading}
            error={error}
            onRetry={onReload}
            onPressBanner={(href) => (href ? onNavigate?.(href) : undefined)}
            onPressProduct={(item) => onSelectProduct?.(item.id)}
            onAddToCart={(item) => onAddToCart?.(item.id)}
          />
        ))}

      {/* 11. Testimonials + UGC strip */}
      {ugcItems.length > 0 && (
        <TestimonialsBlock
          ugcItems={ugcItems}
          isDesktop={isDesktop}
          onNavigate={onNavigate}
        />
      )}

      {/* 12. Newsletter / loyalty CTA */}
      {newsletterCta && (
        <Box
          style={{
            width: '100%',
            maxWidth: layout.containerMaxWidth,
            alignSelf: 'center',
            paddingHorizontal: isDesktop
              ? componentTokens.storefrontHome.contentPaddingXDesktop
              : componentTokens.storefrontHome.contentPaddingXMobile,
          }}
        >
          <NewsletterLoyaltyCta
            title={newsletterCta.title}
            subtitle={newsletterCta.subtitle}
            ctaLabel={newsletterCta.ctaLabel}
          />
        </Box>
      )}
    </Box>
  )
}

import { useMemo } from 'react'
import { useBreakpoint, useThemeColors } from '@real/ui/responsive'
import { componentTokens, layout } from '@real/tokens'
import {
  AnnouncementTicker,
  BrandSpotlightPanel,
  BrandSpotlightSection,
  CategoryRail,
  EditorialHotspotSection,
  FlashSaleBand,
  HeroTileRail,
  NewsletterLoyaltyCta,
  OfferBannersGrid,
  ProductRail,
  TestimonialsBlock,
} from '@real/ui/components'
import type { OfferBannerBlock } from '@real/ui/components'
import type { ProductCardModel } from '@real/ui/components/ProductCard.types'
import {
  HomeBrandItem,
  HomeCategoryItem,
  HomeEducationBanner,
  HomeEditorialHotspotSection,
  HomeHeroItem,
  HomeNewsletterCta,
  HomeUgcItem,
} from '@real/ui/components/home/types'
import { Box } from '@real/ui/primitives'

type ResolvedRail = {
  id: string
  title: string
  items: ProductCardModel[]
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
  items: ProductCardModel[]
}

type TickerItem = {
  id: string
  label: string
  href?: string
  badgeLabel?: string
  ctaLabel?: string
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

type HomeV2SectionsProps = {
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
  onAddToCart?: (productId: string) => void
  onAddAllToCart?: (productIds: string[]) => void
}

export function HomeV2Sections({
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
  onAddToCart,
  onAddAllToCart,
}: HomeV2SectionsProps) {
  const profile = useBreakpoint()
  const c = useThemeColors()
  const isDesktop = profile.breakpoint === 'desktop'
  const layoutTokens = componentTokens.storefrontHome.layout

  const flashOffersRail =
    trendingRail ??
    bundlesRail ??
    communityFavoritesRail ??
    personalizedRail ??
    bestSellersRail ??
    newArrivalsRail
  const bestSellerShowcaseRail = [bestSellersRail, communityFavoritesRail, personalizedRail, trendingRail]
    .find((rail) => rail && rail.id !== flashOffersRail?.id) ?? null
  const newArrivalsShowcaseRail = [newArrivalsRail, trendingRail, personalizedRail]
    .find((rail) => rail && rail.id !== flashOffersRail?.id && rail.id !== bestSellerShowcaseRail?.id) ?? null

  const promoBlocks: OfferBannerBlock[] = offerBanners
    ? offerBanners.map((banner) => ({
        title: banner.title ?? '',
        subtitle: banner.subtitle,
        ctaLabel: banner.ctaLabel,
        href: banner.href,
        imageUrl: banner.imageUrl,
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
      ].filter((block): block is NonNullable<typeof block> => Boolean(block))

  const showcaseImageUrl =
    spotlight?.bannerImageUrl ??
    promoBlocks[0]?.imageUrl ??
    heroItems[0]?.imageUrl ??
    ugcItems[0]?.imageUrl

  return (
    <Box
      style={{
        width: '100%',
        gap: layoutTokens.rootGap,
        backgroundColor: c.background,
      }}
    >
      {tickerItems.length > 0 ? (
        <AnnouncementTicker
          items={tickerItems.map((item) => ({
            ...item,
            badgeLabel: tickerItems.length === 1 && heroItems.length > 0 ? (locale === 'ar' ? 'حملة' : 'Campaign') : item.badgeLabel,
            ctaLabel: tickerItems.length === 1 && heroItems.length > 0 && item.href ? (locale === 'ar' ? 'تسوّق الآن' : 'Shop now') : item.ctaLabel,
          }))}
          speedMs={tickerSpeedMs}
          variant={tickerItems.length === 1 && heroItems.length > 0 ? 'campaign' : 'utility'}
          onPressItem={(href) => (href ? onNavigate?.(href) : undefined)}
        />
      ) : null}

      {heroItems.length > 0 ? (
        <HeroTileRail
          heroItems={heroItems}
          promoBlocks={promoBlocks
            .filter((block): block is OfferBannerBlock & { title: string } => typeof block.title === 'string' && block.title.length > 0)
            .slice(0, 3)}
          autoplay={heroAutoplay}
          autoplayMs={heroAutoplayMs}
          onNavigate={onNavigate}
        />
      ) : null}

      {categoryItems.length > 0 ? (
        <CategoryRail
          items={categoryItems}
          autoplay={railAutoplay?.categories?.enabled}
          autoplayMs={railAutoplay?.categories?.autoplayMs}
          onPressItem={(item) => onNavigate?.(item.href ?? '/shop')}
        />
      ) : null}

      {flashSale ? (
        <FlashSaleBand
          offerText={flashSale.offerText}
          preLabel={flashSale.preLabel}
          postLabel={flashSale.postLabel}
          endsAtIso={flashSale.endsAtIso}
          ctaLabel={flashSale.ctaLabel}
        />
      ) : null}

      {flashOffersRail ? (
        <ProductRail
          title={flashOffersRail.title}
          actionLabel='Shop All'
          actionHref='/shop'
          items={flashOffersRail.items}
          cardVariant='compact'
          showFilterChips
          autoplay={railAutoplay?.featured?.enabled}
          autoplayMs={railAutoplay?.featured?.autoplayMs}
          loading={loading}
          error={error}
          onRetry={onReload}
          onPressAction={() => onNavigate?.('/shop')}
          onSelectProduct={onSelectProduct}
          onAddToCart={onAddToCart}
        />
      ) : null}

      {bestSellerShowcaseRail ? (
        <ProductRail
          title={bestSellerShowcaseRail.title}
          actionLabel='Shop All'
          actionHref='/shop'
          items={bestSellerShowcaseRail.items}
          autoplay={railAutoplay?.featured?.enabled}
          autoplayMs={railAutoplay?.featured?.autoplayMs}
          loading={loading}
          error={error}
          onRetry={onReload}
          onPressAction={() => onNavigate?.('/shop')}
          onSelectProduct={onSelectProduct}
          onAddToCart={onAddToCart}
        />
      ) : null}

      {editorialHotspotSection ? (
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
      ) : null}

      {(showcaseImageUrl || topBrands.length > 0) ? (
        <BrandSpotlightPanel
          showcaseImageUrl={showcaseImageUrl}
          featureTitle={topBrands[0] ? `${topBrands[0].name} beauty spotlight` : undefined}
          featureCtaLabel='Shop now'
          featureHref='/shop'
          brands={topBrands}
          isDesktop={isDesktop}
          onNavigate={onNavigate}
        />
      ) : null}

      {brandSpotlights
        .filter((section) => (section.items?.length ?? 0) > 0)
        .slice(0, 2)
        .map((section) => (
          <BrandSpotlightSection
            key={section.id}
            id={section.id}
            bannerTitle={section.bannerTitle}
            bannerSubtitle={section.bannerSubtitle}
            bannerCtaLabel={section.bannerCtaLabel}
            bannerHref={section.bannerHref}
            bannerImageUrl={section.bannerImageUrl}
            railTitle={section.railTitle}
            items={section.items}
            loading={loading}
            error={error}
            onRetry={onReload}
            onPressBanner={(href) => (href ? onNavigate?.(href) : undefined)}
            onPressProduct={(item) => onSelectProduct?.(item.id)}
            onAddToCart={(item) => onAddToCart?.(item.id)}
          />
        ))}

      {newArrivalsShowcaseRail ? (
        <ProductRail
          title={newArrivalsShowcaseRail.title}
          actionLabel='Shop All'
          actionHref='/shop'
          items={newArrivalsShowcaseRail.items}
          autoplay={railAutoplay?.newArrivals?.enabled}
          autoplayMs={railAutoplay?.newArrivals?.autoplayMs}
          loading={loading}
          error={error}
          onRetry={onReload}
          onPressAction={() => onNavigate?.('/shop')}
          onSelectProduct={onSelectProduct}
          onAddToCart={onAddToCart}
        />
      ) : null}

      {promoBlocks.length > 0 ? (
        <OfferBannersGrid
          title="Today's Deals"
          actionLabel='Shop deals'
          blocks={promoBlocks}
          isDesktop={isDesktop}
          onNavigate={onNavigate}
          onPressAction={() => onNavigate?.('/shop')}
        />
      ) : null}

      {ugcItems.length > 0 ? (
        <TestimonialsBlock
          ugcItems={ugcItems}
          isDesktop={isDesktop}
          onNavigate={onNavigate}
        />
      ) : null}

      {newsletterCta ? (
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
      ) : null}
    </Box>
  )
}

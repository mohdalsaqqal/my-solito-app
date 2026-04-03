import { useMemo } from 'react'
import { localizeString } from '@real/app/lib/cms/blocks'
import type { LocalizedString } from '@real/app/lib/types'
import { HomeBlocksRenderer } from '@real/app/features/home/HomeBlocksRenderer'
import type { RegisteredHomePageBlock } from '@real/app/sections/blocks/block-types'
import { useBreakpoint } from '@real/ui/responsive'
import { colors, componentTokens, layout } from '@real/tokens'
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
    return [{
      id: block.id,
      title: resolveBlockString(block, block.title),
      subtitle: resolveBlockString(block, block.subtitle),
      ctaLabel: resolveBlockString(block, block.ctaLabel),
      href: block.href,
      imageUrl: block.imageUrl,
    }]
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
  onAddToCart?: (productId: string) => void
  onAddAllToCart?: (productIds: string[]) => void
}

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
  onAddToCart,
  onAddAllToCart,
}: HomeV2SectionsProps) {
  const profile = useBreakpoint()
  const isDesktop = profile.breakpoint === 'desktop'
  const layoutTokens = componentTokens.storefrontHome.layout
  const orderedHomeBlocks = useMemo(
    () =>
      homeBlocks && homeBlocks.length > 0
        ? [...homeBlocks].sort((left, right) => left.position - right.position)
        : null,
    [homeBlocks],
  )

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

  if (orderedHomeBlocks && orderedHomeBlocks.length > 0) {
    return (
      <HomeBlocksRenderer
        blocks={orderedHomeBlocks}
        loading={loading}
        error={error}
        tickerSpeedMs={tickerSpeedMs}
        railAutoplay={railAutoplay}
        locale={locale}
        onReload={onReload}
        onNavigate={onNavigate}
        onSelectProduct={onSelectProduct}
        onAddToCart={onAddToCart}
        onAddAllToCart={onAddAllToCart}
      />
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

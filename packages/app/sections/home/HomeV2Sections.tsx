import { motionDuration, spacing } from '@real/tokens'
import { Box } from '@real/ui/primitives'
import {
  AnnouncementTicker,
  BestItemsMonthRail,
  BrandSpotlightSection,
  BrandStoryBanner,
  BundlePromotionsRail,
  CampaignHeroBlock,
  FeaturedCampaignSlot,
  FlashSaleBand,
  HeroCampaignSlider,
  NewsletterLoyaltyCta,
  RevealOnScroll,
  TopBrandsGrid,
  UgcGallery,
} from '@real/ui/components'
import {
  HomeBrandItem,
  HomeEducationBanner,
  HomeHeroItem,
  HomeNewsletterCta,
  HomeProductItem,
  HomeUgcItem,
} from '@real/ui/components/home/types'

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

type HomeV2SectionsProps = {
  heroItems: HomeHeroItem[]
  tickerItems: TickerItem[]
  bestSellersRail: ResolvedRail | null
  trendingRail: ResolvedRail | null
  bundlesRail: ResolvedRail | null
  newArrivalsRail: ResolvedRail | null
  communityFavoritesRail: ResolvedRail | null
  personalizedRail: ResolvedRail | null
  featuredSlot: FeaturedSlot | null
  spotlight: SpotlightSection | null
  educationBanner: HomeEducationBanner | null
  topBrandsTitle?: string
  topBrands: HomeBrandItem[]
  ugcTitle?: string
  ugcItems: HomeUgcItem[]
  newsletterCta: HomeNewsletterCta | null
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
  onReload: () => void
  onNavigate?: (href: string) => void
  onSelectProduct?: (productId: string) => void
  onAddToCart?: (productId: string) => void
}

function renderRail(
  rail: ResolvedRail | null,
  loading: boolean,
  error: string | null,
  onReload: () => void,
  onSelectProduct?: (productId: string) => void,
  onAddToCart?: (productId: string) => void,
) {
  if (!rail) {
    return null
  }

  return (
    <Box key={rail.id} style={{ gap: spacing['16'] }}>
      <BestItemsMonthRail
        title={rail.title}
        items={rail.items}
        loading={loading}
        error={error}
        onRetry={onReload}
        onPressProduct={(item) => onSelectProduct?.(item.id)}
        onAddToCart={(item) => onAddToCart?.(item.id)}
      />
    </Box>
  )
}

export function HomeV2Sections({
  heroItems,
  tickerItems,
  bestSellersRail,
  trendingRail,
  bundlesRail,
  newArrivalsRail,
  communityFavoritesRail,
  personalizedRail,
  featuredSlot,
  spotlight,
  educationBanner,
  topBrandsTitle,
  topBrands,
  ugcTitle,
  ugcItems,
  newsletterCta,
  loading,
  error,
  tickerSpeedMs,
  heroAutoplay,
  heroAutoplayMs,
  flashSale = null,
  campaignAnchor2 = null,
  onReload,
  onNavigate,
  onSelectProduct,
  onAddToCart,
}: HomeV2SectionsProps) {
  const hasDistinctTrendingRail = Boolean(
    trendingRail && trendingRail.id !== bestSellersRail?.id,
  )

  return (
    <Box px='pageX' pt='none' pb='sectionY' gap={spacing['24']}>
      <RevealOnScroll delayMs={0}>
        <HeroCampaignSlider
          items={heroItems}
          autoplay={heroAutoplay}
          autoplayMs={heroAutoplayMs}
          onPressItem={(href) => {
            if (href) onNavigate?.(href)
          }}
        />
      </RevealOnScroll>

      <RevealOnScroll delayMs={motionDuration.stagger * 2}>
        <AnnouncementTicker
          items={tickerItems}
          speedMs={tickerSpeedMs}
          onPressItem={(href) => {
            if (href) onNavigate?.(href)
          }}
        />
      </RevealOnScroll>

      {/* Flash sale band — crimson urgency section with countdown */}
      {flashSale ? (
        <RevealOnScroll delayMs={motionDuration.stagger * 2}>
          <FlashSaleBand
            offerText={flashSale.offerText}
            preLabel={flashSale.preLabel}
            postLabel={flashSale.postLabel}
            endsAtIso={flashSale.endsAtIso}
            ctaLabel={flashSale.ctaLabel}
            loading={loading}
          />
        </RevealOnScroll>
      ) : null}

      <RevealOnScroll delayMs={motionDuration.stagger * 3}>
        {renderRail(
          bestSellersRail,
          loading,
          error,
          onReload,
          onSelectProduct,
          onAddToCart,
        )}
      </RevealOnScroll>

      {/* Campaign anchor 2 — ink editorial section */}
      {campaignAnchor2 ? (
        <RevealOnScroll delayMs={motionDuration.stagger * 4}>
          <CampaignHeroBlock
            headline={campaignAnchor2.headline}
            preHeadline={campaignAnchor2.preHeadline}
            subline={campaignAnchor2.subline}
            badgeLabel={campaignAnchor2.badgeLabel}
            ctaLabel={campaignAnchor2.ctaLabel}
            imageUrl={campaignAnchor2.imageUrl}
            loading={loading}
            onPress={campaignAnchor2.href ? () => onNavigate?.(campaignAnchor2.href!) : undefined}
          />
        </RevealOnScroll>
      ) : null}

      {spotlight ? (
        <RevealOnScroll key={spotlight.id} delayMs={motionDuration.stagger * 4}>
          <BrandSpotlightSection
            id={spotlight.id}
            bannerTitle={spotlight.bannerTitle}
            bannerSubtitle={spotlight.bannerSubtitle}
            bannerCtaLabel={spotlight.bannerCtaLabel}
            bannerHref={spotlight.bannerHref}
            bannerImageUrl={spotlight.bannerImageUrl}
            railTitle={spotlight.railTitle}
            items={spotlight.items}
            loading={loading}
            error={error}
            onRetry={onReload}
            onPressBanner={(href) => {
              if (href) onNavigate?.(href)
            }}
            onPressProduct={(item) => onSelectProduct?.(item.id)}
            onAddToCart={(item) => onAddToCart?.(item.id)}
          />
        </RevealOnScroll>
      ) : null}

      {!spotlight && featuredSlot ? (
        <RevealOnScroll delayMs={motionDuration.stagger * 4}>
          <FeaturedCampaignSlot
            title={featuredSlot.title}
            subtitle={featuredSlot.subtitle}
            ctaLabel={featuredSlot.ctaLabel}
            href={featuredSlot.href}
            imageUrl={featuredSlot.imageUrl}
            onPress={(href) => {
              if (href) onNavigate?.(href)
            }}
          />
        </RevealOnScroll>
      ) : null}

      {hasDistinctTrendingRail ? (
        <RevealOnScroll delayMs={motionDuration.stagger * 5}>
          {renderRail(
            trendingRail,
            loading,
            error,
            onReload,
            onSelectProduct,
            onAddToCart,
          )}
        </RevealOnScroll>
      ) : null}

      {educationBanner ? (
        <RevealOnScroll delayMs={motionDuration.stagger * 6}>
          <BrandStoryBanner
            title={educationBanner.title}
            subtitle={educationBanner.subtitle}
            ctaLabel={educationBanner.ctaLabel}
            href={educationBanner.href}
            imageUrl={educationBanner.imageUrl}
            onPress={(href) => {
              if (href) onNavigate?.(href)
            }}
          />
        </RevealOnScroll>
      ) : null}

      {bundlesRail ? (
        <RevealOnScroll key={bundlesRail.id} delayMs={motionDuration.stagger * 7}>
          <Box style={{ gap: spacing['16'] }}>
            <BundlePromotionsRail
              title={bundlesRail.title}
              items={bundlesRail.items}
              loading={loading}
              error={error}
              onRetry={onReload}
              onPressProduct={(item) => onSelectProduct?.(item.id)}
              onAddToCart={(item) => onAddToCart?.(item.id)}
            />
          </Box>
        </RevealOnScroll>
      ) : null}

      <RevealOnScroll delayMs={motionDuration.stagger * 8}>
        {renderRail(
          newArrivalsRail,
          loading,
          error,
          onReload,
          onSelectProduct,
          onAddToCart,
        )}
      </RevealOnScroll>

      <RevealOnScroll delayMs={motionDuration.stagger * 9}>
        {renderRail(
          communityFavoritesRail,
          loading,
          error,
          onReload,
          onSelectProduct,
          onAddToCart,
        )}
      </RevealOnScroll>

      <RevealOnScroll delayMs={motionDuration.stagger * 10}>
        {renderRail(
          personalizedRail,
          loading,
          error,
          onReload,
          onSelectProduct,
          onAddToCart,
        )}
      </RevealOnScroll>

      {topBrands.length > 0 ? (
        <RevealOnScroll delayMs={motionDuration.stagger * 10}>
          <TopBrandsGrid
            title={topBrandsTitle}
            items={topBrands}
            onPressItem={(item) => {
              if (item.href) onNavigate?.(item.href)
            }}
          />
        </RevealOnScroll>
      ) : null}

      <RevealOnScroll delayMs={motionDuration.stagger * 11}>
        <UgcGallery
          title={ugcTitle}
          items={ugcItems}
          state={loading ? 'loading' : error ? 'error' : 'default'}
          errorMessage={error}
          onRetry={onReload}
          onPressItem={(item) => {
            if (item.href) {
              onNavigate?.(item.href)
              return
            }
            if (item.productId) {
              onSelectProduct?.(item.productId)
            }
          }}
        />
      </RevealOnScroll>

      {newsletterCta ? (
        <RevealOnScroll delayMs={motionDuration.stagger * 12}>
          <NewsletterLoyaltyCta
            title={newsletterCta.title}
            subtitle={newsletterCta.subtitle}
            ctaLabel={newsletterCta.ctaLabel}
            onSubmit={async () => ({ ok: true, message: 'Subscribed successfully.' })}
          />
        </RevealOnScroll>
      ) : null}
    </Box>
  )
}

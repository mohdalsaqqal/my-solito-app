import { motionDuration, spacing } from '@real/tokens'
import { Box } from '@real/ui/primitives'
import {
  AnnouncementTicker,
  BestItemsMonthRail,
  BrandSpotlightSection,
  BundlePromotionsRail,
  FeaturedCampaignSlot,
  HeroCampaignSlider,
  RevealOnScroll,
  TopBrandsGrid,
} from '@real/ui/components'
import { HomeBrandItem, HomeHeroItem, HomeProductItem } from '@real/ui/components/home/types'

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
  flashRail: ResolvedRail | null
  primaryRail: ResolvedRail | null
  featuredSlot: FeaturedSlot | null
  spotlight: SpotlightSection | null
  topBrandsTitle?: string
  topBrands: HomeBrandItem[]
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

export function HomeV2Sections({
  heroItems,
  tickerItems,
  flashRail,
  primaryRail,
  featuredSlot,
  spotlight,
  topBrandsTitle,
  topBrands,
  loading,
  error,
  tickerSpeedMs,
  heroAutoplay,
  heroAutoplayMs,
  onReload,
  onNavigate,
  onSelectProduct,
  onAddToCart,
}: HomeV2SectionsProps) {
  return (
    <Box px='pageX' pt='none' pb='sectionY' gap={spacing['24']}>
      <Box gap={0}>
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
      </Box>

      {flashRail ? (
        <RevealOnScroll key={flashRail.id} delayMs={motionDuration.stagger * 2}>
          <Box style={{ gap: spacing['16'] }}>
            <BundlePromotionsRail
              title={flashRail.title}
              items={flashRail.items}
              loading={loading}
              error={error}
              onRetry={onReload}
              onPressProduct={(item) => onSelectProduct?.(item.id)}
              onAddToCart={(item) => onAddToCart?.(item.id)}
            />
          </Box>
        </RevealOnScroll>
      ) : null}

      {!flashRail && featuredSlot ? (
        <RevealOnScroll delayMs={motionDuration.stagger * 3}>
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

      <RevealOnScroll delayMs={motionDuration.stagger * 3}>
        <AnnouncementTicker
          items={tickerItems}
          speedMs={tickerSpeedMs}
          onPressItem={(href) => {
            if (href) onNavigate?.(href)
          }}
        />
      </RevealOnScroll>

      {primaryRail ? (
        <RevealOnScroll key={primaryRail.id} delayMs={motionDuration.stagger * 4}>
          <Box style={{ gap: spacing['16'] }}>
            <BestItemsMonthRail
              title={primaryRail.title}
              items={primaryRail.items}
              loading={loading}
              error={error}
              onRetry={onReload}
              onPressProduct={(item) => onSelectProduct?.(item.id)}
              onAddToCart={(item) => onAddToCart?.(item.id)}
            />
          </Box>
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

      <RevealOnScroll delayMs={motionDuration.stagger * 5}>
        <TopBrandsGrid
          title={topBrandsTitle}
          items={topBrands}
          onPressItem={(item) => {
            if (item.href) onNavigate?.(item.href)
          }}
        />
      </RevealOnScroll>
    </Box>
  )
}


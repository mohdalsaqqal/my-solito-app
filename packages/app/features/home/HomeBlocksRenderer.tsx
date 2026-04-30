import { Fragment, useCallback, useMemo } from 'react'
import { componentTokens, spacing } from '@real/tokens'
import { useBreakpoint, useThemeColors } from '@real/ui/responsive'
import { Box } from '@real/ui/primitives'
import { RevealOnScroll } from '@real/ui/components'
import { AnnouncementTicker } from '@real/ui/components'
import { resolveBlockString } from '../../sections/blocks/block-types'
import { buildHomeLayout } from './home-layout-engine'
import { renderHeroBlock } from './renderers/renderHeroBlock'
import { renderProductRailBlock } from './renderers/renderProductRailBlock'
import { renderCategoryBlock } from './renderers/renderCategoryBlock'
import { renderOfferBannersBlock } from './renderers/renderOfferBannersBlock'
import { renderBrandSpotlightBlock } from './renderers/renderBrandSpotlightBlock'
import { renderFlashSaleBlock } from './renderers/renderFlashSaleBlock'
import { renderEditorialHotspotBlock } from './renderers/renderEditorialHotspotBlock'
import { renderMiscBlock } from './renderers/renderMiscBlock'
import { renderRecentlyViewedBlock } from './renderers/renderRecentlyViewedBlock'
import { renderFeatureBannerBlock } from './renderers/renderFeatureBannerBlock'
import { renderBrandPanelBlock } from './renderers/renderBrandPanelBlock'
import { renderBrandDealBannerBlock } from './renderers/renderBrandDealBannerBlock'
import type {
  HomeBlockRendererRailAutoplaySettings,
  RegisteredHomePageBlock,
} from '../../sections/blocks/block-types'
import type { IndependentRenderSlot } from './home-types'
import type { HomeProductItem } from '@real/ui/components/home/types'

type Props = {
  blocks: RegisteredHomePageBlock[]
  loading: boolean
  error: string | null
  tickerSpeedMs: number
  railAutoplay?: HomeBlockRendererRailAutoplaySettings
  locale?: 'en' | 'ar'
  onReload: () => void
  onNavigate?: (href: string) => void
  onSelectProduct?: (productId: string) => void
  onQuickView?: (item: HomeProductItem) => void
  onAddToCart?: (productId: string) => void
  onAddAllToCart?: (productIds: string[]) => void
}

type DispatchProps = {
  slot: IndependentRenderSlot
  loading: boolean
  error: string | null
  tickerSpeedMs: number
  railAutoplayMs: number
  brandAutoplayMs: number
  isDesktop: boolean
  onReload: () => void
  onNavigate?: (href: string) => void
  onSelectProduct?: (productId: string) => void
  onAddToCart?: (productId: string) => void
  onAddAllToCart?: (productIds: string[]) => void
}

function resolveHomeRenderer(p: DispatchProps) {
  const { block } = p.slot

  if (block.type === 'hero_carousel' || block.type === 'hero') {
    return renderHeroBlock({ slot: p.slot, onNavigate: p.onNavigate })
  }

  if (block.type === 'product_slider' || block.type === 'personalized_rail') {
    return renderProductRailBlock({
      slot: p.slot,
      loading: p.loading,
      error: p.error,
      railAutoplayMs: p.railAutoplayMs,
      onReload: p.onReload,
      onNavigate: p.onNavigate,
      onSelectProduct: p.onSelectProduct,
      onAddToCart: p.onAddToCart,
    })
  }

  if (block.type === 'category_shortcuts') {
    return renderCategoryBlock({ slot: p.slot, onNavigate: p.onNavigate })
  }

  if (
    block.type === 'offer_banners' ||
    block.type === 'education_banner' ||
    block.type === 'offer_stack' ||
    block.type === 'sticky_listing_promo'
  ) {
    return renderOfferBannersBlock({ slot: p.slot, isDesktop: p.isDesktop, onNavigate: p.onNavigate })
  }

  if (block.type === 'brand_spotlight') {
    if (p.isDesktop) {
      return renderBrandPanelBlock({ slot: p.slot, onNavigate: p.onNavigate })
    }
    return renderBrandSpotlightBlock({
      slot: p.slot,
      loading: p.loading,
      error: p.error,
      railAutoplayMs: p.brandAutoplayMs,
      onReload: p.onReload,
      onNavigate: p.onNavigate,
      onSelectProduct: p.onSelectProduct,
      onAddToCart: p.onAddToCart,
    })
  }

  if (block.type === 'brand_promo') {
    return renderBrandSpotlightBlock({
      slot: p.slot,
      loading: p.loading,
      error: p.error,
      railAutoplayMs: p.brandAutoplayMs,
      onReload: p.onReload,
      onNavigate: p.onNavigate,
      onSelectProduct: p.onSelectProduct,
      onAddToCart: p.onAddToCart,
    })
  }

  if (block.type === 'flash_sale') {
    return renderFlashSaleBlock({ slot: p.slot, onNavigate: p.onNavigate })
  }

  if (block.type === 'editorial_hotspot') {
    return renderEditorialHotspotBlock({
      slot: p.slot,
      onNavigate: p.onNavigate,
      onSelectProduct: p.onSelectProduct,
      onAddToCart: p.onAddToCart,
      onAddAllToCart: p.onAddAllToCart,
    })
  }

  if (block.type === 'newsletter_cta' || block.type === 'top_brands' || block.type === 'ugc_gallery') {
    return renderMiscBlock({ slot: p.slot, isDesktop: p.isDesktop, onNavigate: p.onNavigate })
  }

  if (block.type === 'cart_upsell_rail') {
    return renderRecentlyViewedBlock({
      slot: p.slot,
      onNavigate: p.onNavigate,
      onSelectProduct: p.onSelectProduct,
      onAddToCart: p.onAddToCart,
    })
  }

  if (block.type === 'pdp_offer_cluster') {
    return renderFeatureBannerBlock({ slot: p.slot, onNavigate: p.onNavigate })
  }

  if (block.type === 'brand_deal_banner') {
    return renderBrandDealBannerBlock({ slot: p.slot, onNavigate: p.onNavigate })
  }

  if (block.type === 'promo_strip') {
    return (
      <AnnouncementTicker
        items={[
          {
            id: block.id,
            label: block.textValue ?? resolveBlockString(block.locale, block.text, ''),
            href: block.href,
            badgeLabel: block.locale === 'ar' ? 'حملة' : 'Campaign',
            ctaLabel: block.locale === 'ar' ? 'تسوّق الآن' : 'Shop now',
          },
        ]}
        speedMs={p.tickerSpeedMs}
        variant='campaign'
        onPressItem={(href) => (href ? p.onNavigate?.(href) : undefined)}
      />
    )
  }

  return null
}

type HomeBlockType = NonNullable<Props['blocks'][number]['props']>['type']

function shouldSkipReveal(type: HomeBlockType): boolean {
  // Hero and promo ticker are always visible — no scroll reveal
  return type === 'hero_carousel' || type === 'hero' || type === 'promo_strip'
}

function getSectionGap(currentType: HomeBlockType, nextType?: HomeBlockType): number {
  // After hero → tight (category strip feels connected)
  if (currentType === 'hero_carousel' && nextType === 'category_shortcuts') return spacing.space4
  // After category → standard
  if (currentType === 'category_shortcuts') return spacing.space8
  // Before/after flash deals → generous
  if (currentType === 'flash_sale' || nextType === 'flash_sale') return spacing.space10
  // Before newsletter → extra generous
  if (nextType === 'newsletter_cta') return spacing.space16
  // Before editorial → breathing room
  if (nextType === 'editorial_hotspot') return spacing.space12
  // Default
  return spacing.space8
}

export function HomeBlocksRenderer({
  blocks,
  loading,
  error,
  tickerSpeedMs,
  railAutoplay,
  locale = 'en',
  onReload,
  onNavigate,
  onSelectProduct,
  onAddToCart,
  onAddAllToCart,
}: Props) {
  const profile = useBreakpoint()
  const isDesktop = profile.breakpoint === 'desktop'
  const layoutTokens = componentTokens.storefrontHome.layout
  const railAutoplayMs = railAutoplay?.featured?.autoplayMs ?? 5000
  const brandAutoplayMs = railAutoplay?.brandSpotlights?.autoplayMs ?? 5200

  const slots = useMemo(
    () => buildHomeLayout(blocks.map((b) => b.props), profile),
    [blocks, profile],
  )

  // Build a flat list of block types for gap calculation
  const blockTypes = useMemo(() => {
    const types: HomeBlockType[] = []
    slots.forEach((slot) => {
      if (slot.kind === 'paired') {
        types.push(slot.strip.type, slot.hero.type)
      } else {
        types.push(slot.block.type)
      }
    })
    return types
  }, [slots])

  const c = useThemeColors()

  const dispatchHomeRenderer = useCallback(
    (p: DispatchProps) => resolveHomeRenderer(p),
    [],
  )

  return (
    <Box style={{ width: '100%', backgroundColor: c.background }}>
      {(() => {
        let absIndex = 0
        let revealIndex = 0
        return slots.map((slot) => {
          if (slot.kind === 'paired') {
            const stripSlot: IndependentRenderSlot = {
              kind: 'independent',
              block: slot.strip,
              profile,
              index: slot.stripIndex,
            }
            const heroSlot: IndependentRenderSlot = {
              kind: 'independent',
              block: slot.hero,
              profile,
              index: slot.heroIndex,
            }

            const currentStripType = slot.strip.type
            const previousStripType = blockTypes[absIndex - 1] ?? currentStripType
            const stripGap = absIndex === 0 ? 0 : getSectionGap(previousStripType, currentStripType)

            const stripNode = dispatchHomeRenderer({
              slot: stripSlot,
              loading,
              error,
              tickerSpeedMs,
              railAutoplayMs,
              isDesktop,
              brandAutoplayMs,
              onReload,
              onNavigate,
              onSelectProduct,
              onAddToCart,
              onAddAllToCart,
            })
            absIndex++

            const currentHeroType = slot.hero.type
            const previousHeroType = blockTypes[absIndex - 1] ?? currentHeroType
            const heroGap = absIndex === 0 ? 0 : getSectionGap(previousHeroType, currentHeroType)

            const heroNode = dispatchHomeRenderer({
              slot: heroSlot,
              loading,
              error,
              tickerSpeedMs,
              railAutoplayMs,
              isDesktop,
              brandAutoplayMs,
              onReload,
              onNavigate,
              onSelectProduct,
              onAddToCart,
              onAddAllToCart,
            })
            absIndex++

            if (!stripNode && !heroNode) return null

            // Hero never reveals; strip reveals with stagger
            const stripRevealDelay = shouldSkipReveal(currentStripType) ? 0 : revealIndex * 40
            const heroRevealDelay = 0 // hero always visible
            if (!shouldSkipReveal(currentStripType)) revealIndex++

            const wrappedStrip = shouldSkipReveal(currentStripType)
              ? stripNode
              : <RevealOnScroll delayMs={stripRevealDelay} liftY={12}>{stripNode}</RevealOnScroll>
            const wrappedHero = shouldSkipReveal(currentHeroType)
              ? heroNode
              : <RevealOnScroll delayMs={heroRevealDelay} liftY={12}>{heroNode}</RevealOnScroll>

            return (
              <Fragment key={`paired-${slot.stripIndex}-${slot.heroIndex}`}>
                <Box style={{ marginTop: stripGap }}>
                  {wrappedStrip}
                  <Box style={{ marginTop: heroGap }}>
                    {wrappedHero}
                  </Box>
                </Box>
              </Fragment>
            )
          }

          const currentType = slot.block.type
          const previousType = blockTypes[absIndex - 1] ?? currentType
          const gap = absIndex === 0 ? 0 : getSectionGap(previousType, currentType)
          absIndex++

          const node = dispatchHomeRenderer({
            slot,
            loading,
            error,
            tickerSpeedMs,
            railAutoplayMs,
            isDesktop,
            brandAutoplayMs,
            onReload,
            onNavigate,
            onSelectProduct,
            onAddToCart,
            onAddAllToCart,
          })

          if (!node) return null

          const revealDelay = shouldSkipReveal(currentType) ? 0 : revealIndex * 40
          if (!shouldSkipReveal(currentType)) revealIndex++

          const wrappedNode = shouldSkipReveal(currentType)
            ? node
            : <RevealOnScroll delayMs={revealDelay} liftY={12}>{node}</RevealOnScroll>

          return (
            <Fragment key={`slot-${slot.index}`}>
              <Box style={{ marginTop: gap }}>
                {wrappedNode}
              </Box>
            </Fragment>
          )
        })
      })()}
    </Box>
  )
}

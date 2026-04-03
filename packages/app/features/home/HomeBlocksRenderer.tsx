import { Fragment, useMemo } from 'react'
import { colors, componentTokens } from '@real/tokens'
import { useBreakpoint } from '@real/ui/responsive'
import { Box } from '@real/ui/primitives'
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

/**
 * Routes an independent slot to its dedicated home renderer by block type.
 * This is the Phase 4 dispatcher — one function per block type family.
 */
function dispatchHomeRenderer(p: DispatchProps) {
  const { block } = p.slot

  // Hero family
  if (block.type === 'hero_carousel' || block.type === 'hero') {
    return renderHeroBlock({ slot: p.slot, onNavigate: p.onNavigate })
  }

  // Product rail family
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

  // Category family
  if (block.type === 'category_shortcuts') {
    return renderCategoryBlock({ slot: p.slot, onNavigate: p.onNavigate })
  }

  // Offer banners family
  if (
    block.type === 'offer_banners' ||
    block.type === 'education_banner' ||
    block.type === 'offer_stack' ||
    block.type === 'sticky_listing_promo'
  ) {
    return renderOfferBannersBlock({ slot: p.slot, isDesktop: p.isDesktop, onNavigate: p.onNavigate })
  }

  // Brand family — desktop uses two-column panel layout, mobile/tablet uses rail
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

  // Flash sale
  if (block.type === 'flash_sale') {
    return renderFlashSaleBlock({ slot: p.slot, onNavigate: p.onNavigate })
  }

  // Editorial hotspot
  if (block.type === 'editorial_hotspot') {
    return renderEditorialHotspotBlock({
      slot: p.slot,
      onNavigate: p.onNavigate,
      onSelectProduct: p.onSelectProduct,
      onAddToCart: p.onAddToCart,
      onAddAllToCart: p.onAddAllToCart,
    })
  }

  // Misc family: newsletter_cta, top_brands, ugc_gallery
  if (block.type === 'newsletter_cta' || block.type === 'top_brands' || block.type === 'ugc_gallery') {
    return renderMiscBlock({ slot: p.slot, isDesktop: p.isDesktop, onNavigate: p.onNavigate })
  }

  // Recently viewed / upsell rail
  if (block.type === 'cart_upsell_rail') {
    return renderRecentlyViewedBlock({
      slot: p.slot,
      onNavigate: p.onNavigate,
      onSelectProduct: p.onSelectProduct,
      onAddToCart: p.onAddToCart,
    })
  }

  // Feature banner (PDP offer cluster used as homepage campaign slot)
  if (block.type === 'pdp_offer_cluster') {
    return renderFeatureBannerBlock({ slot: p.slot, onNavigate: p.onNavigate })
  }

  // promo_strip as standalone (not paired) — AnnouncementTicker
  if (block.type === 'promo_strip') {
    return (
      <AnnouncementTicker
        items={[{
          id: block.id,
          label: block.textValue ?? resolveBlockString(block.locale, block.text, ''),
          href: block.href,
          badgeLabel: block.locale === 'ar' ? 'حملة' : 'Campaign',
          ctaLabel: block.locale === 'ar' ? 'تسوّق الآن' : 'Shop now',
        }]}
        speedMs={p.tickerSpeedMs}
        variant='campaign'
        onPressItem={(href) => (href ? p.onNavigate?.(href) : undefined)}
      />
    )
  }

  return null
}

/**
 * Client component that wires the home layout engine to dedicated home renderers.
 *
 * Phase 4: routes each resolved slot directly to its typed renderer function
 * instead of going through the generic BlockRenderer → block-registry path.
 *
 * - useBreakpoint() is the single source of truth for width-driven layout
 * - buildHomeLayout is pure and re-runs on every profile change
 * - Each renderer receives a typed IndependentRenderSlot (block + profile)
 */
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

  const rawBlocks = useMemo(() => blocks.map((b) => b.props), [blocks])

  const slots = useMemo(
    () => buildHomeLayout(rawBlocks, profile),
    [rawBlocks, profile],
  )

  return (
    <Box style={{ width: '100%', backgroundColor: colors.background }}>
      {slots.map((slot, index) => {
        if (slot.kind === 'paired') {
          // Desktop: promo_strip fused above hero — both rendered as one visual unit
          const stripRaw = rawBlocks[slot.stripIndex]
          const heroRaw = rawBlocks[slot.heroIndex]
          if (!stripRaw || !heroRaw) return null

          const stripSlot: IndependentRenderSlot = { kind: 'independent', block: stripRaw, profile, index: slot.stripIndex }
          const heroSlot: IndependentRenderSlot = { kind: 'independent', block: heroRaw, profile, index: slot.heroIndex }

          const stripNode = dispatchHomeRenderer({
            slot: stripSlot, loading, error, tickerSpeedMs, railAutoplayMs,
            isDesktop, brandAutoplayMs, onReload, onNavigate, onSelectProduct, onAddToCart, onAddAllToCart,
          })
          const heroNode = dispatchHomeRenderer({
            slot: heroSlot, loading, error, tickerSpeedMs, railAutoplayMs,
            isDesktop, brandAutoplayMs, onReload, onNavigate, onSelectProduct, onAddToCart, onAddAllToCart,
          })

          if (!stripNode && !heroNode) return null

          return (
            <Fragment key={`paired-${slot.stripIndex}-${slot.heroIndex}`}>
              <Box style={{ marginTop: index === 0 ? 0 : layoutTokens.rootGap }}>
                {stripNode}
                {heroNode}
              </Box>
            </Fragment>
          )
        }

        // Independent slot
        const rawBlock = rawBlocks[slot.index]
        if (!rawBlock) return null

        const node = dispatchHomeRenderer({
          slot: { kind: 'independent', block: rawBlock, profile, index: slot.index },
          loading, error, tickerSpeedMs, railAutoplayMs,
          isDesktop, brandAutoplayMs, onReload, onNavigate, onSelectProduct, onAddToCart, onAddAllToCart,
        })

        if (!node) return null

        return (
          <Fragment key={`slot-${slot.index}`}>
            <Box style={{ marginTop: index === 0 ? 0 : layoutTokens.rootGap }}>
              {node}
            </Box>
          </Fragment>
        )
      })}
    </Box>
  )
}

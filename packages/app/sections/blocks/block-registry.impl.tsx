import { Box } from '@real/ui/primitives'
import {
  AnnouncementTicker,
  BrandSpotlightSection,
  CategoryRail,
  EditorialHotspotSection,
  FlashSaleBand,
  HomeHeroRail,
  NewsletterLoyaltyCta,
  OfferBannersGrid,
  ProductRail,
  TestimonialsBlock,
  TopBrandsGrid,
} from '@real/ui/components'
import type { OfferBannerBlock } from '@real/ui/components'
import { componentTokens, layout } from '@real/tokens'
import type { HomeBlockRendererComponent, RegisteredHomePageBlock } from './block-types'
import {
  mapBrandItems,
  mapProductsToHomeItems,
  resolveBlockString,
  resolvePairString,
} from './block-types'

function mapHeroItems(block: RegisteredHomePageBlock['props']) {
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
        title: resolveBlockString(block.locale, block.title),
        subtitle: resolveBlockString(block.locale, block.subtitle),
        ctaLabel: resolveBlockString(block.locale, block.ctaLabel),
        href: block.href,
        imageUrl: block.imageUrl,
      },
    ]
  }

  return []
}

function mapOfferBannerBlocks(
  locale: 'en' | 'ar',
  items: Array<
    | {
        id: string
        title?: string | { en: string; ar: string }
        subtitle?: string | { en: string; ar: string }
        ctaLabel?: string | { en: string; ar: string }
        ctaText?: string | { en: string; ar: string }
        ctaLabelEn?: string
        ctaLabelAr?: string
        href?: string
        imageUrl?: string
      }
    | {
        id: string
        badge?: string | { en: string; ar: string }
        title: string | { en: string; ar: string }
        subtitle?: string | { en: string; ar: string }
        href?: string
      }
  >,
): OfferBannerBlock[] {
  return items.map((item) => ({
    id: item.id,
    title: 'title' in item ? resolveBlockString(locale, item.title) : undefined,
    subtitle: resolveBlockString(locale, item.subtitle),
    ctaLabel:
      'ctaLabel' in item
        ? resolveBlockString(locale, item.ctaLabel)
        : 'ctaText' in item
          ? resolveBlockString(locale, item.ctaText)
          : 'ctaLabelEn' in item || 'ctaLabelAr' in item
            ? resolvePairString(locale, item.ctaLabelEn, item.ctaLabelAr)
            : undefined,
    href: item.href,
    imageUrl: 'imageUrl' in item ? item.imageUrl : undefined,
  }))
}

function mapCategoryItems(
  locale: 'en' | 'ar',
  items: Array<{
    id: string
    label: string | { en: string; ar: string }
    href?: string
    imageUrl?: string
  }>,
) {
  return items.map((item) => ({
    id: item.id,
    label: resolveBlockString(locale, item.label),
    href: item.href,
    imageUrl: item.imageUrl,
  }))
}

const HeroCarouselBlockComponent: HomeBlockRendererComponent = ({ block, onNavigate }) => {
  const published = block.props
  if (published.type !== 'hero_carousel') return null
  const items = mapHeroItems(published)
  return items.length > 0 ? (
    <HomeHeroRail items={items} autoplay={published.autoplayMs > 0} autoplayMs={published.autoplayMs} onPressItem={onNavigate} />
  ) : null
}

const HeroBlockComponent: HomeBlockRendererComponent = ({ block, onNavigate }) => {
  const published = block.props
  if (published.type !== 'hero') return null
  const items = mapHeroItems(published)
  return items.length > 0 ? <HomeHeroRail items={items} autoplay={false} onPressItem={onNavigate} /> : null
}

const FlashSaleBlockComponent: HomeBlockRendererComponent = ({ block, onNavigate }) => {
  const published = block.props
  if (published.type !== 'flash_sale') return null
  return (
    <FlashSaleBand
      offerText={published.titleText ?? resolvePairString(published.locale, published.titleEn, published.titleAr, '')}
      preLabel={resolvePairString(published.locale, published.urgencyLabelEn, published.urgencyLabelAr, '')}
      postLabel=''
      endsAtIso={published.timerEndsAt}
      ctaLabel={published.ctaText ?? resolvePairString(published.locale, published.ctaLabelEn, published.ctaLabelAr, '')}
      onPressCta={published.href ? () => onNavigate?.(published.href) : undefined}
    />
  )
}

const ProductRailBlockComponent: HomeBlockRendererComponent = ({
  block,
  railAutoplay,
  loading,
  error,
  onReload,
  onNavigate,
  onSelectProduct,
  onQuickView,
  onAddToCart,
}) => {
  const published = block.props
  if (published.type !== 'product_slider' && published.type !== 'personalized_rail') return null
  const items = mapProductsToHomeItems(published.products ?? [])
  return items.length > 0 ? (
    <ProductRail
      title={published.titleText ?? resolveBlockString(published.locale, published.title, '')}
      actionLabel={published.ctaText}
      actionHref={published.href ?? ''}
      items={items}
      showFilterChips={published.type === 'product_slider'}
      autoplay={railAutoplay?.featured?.enabled !== false}
      autoplayMs={railAutoplay?.featured?.autoplayMs ?? 5000}
      loading={loading}
      error={error}
      onRetry={onReload}
      onPressAction={published.href ? () => onNavigate?.(published.href) : undefined}
      onSelectProduct={onSelectProduct}
      onQuickView={onQuickView}
      onAddToCart={onAddToCart}
    />
  ) : null
}

const BrandSpotlightBlockComponent: HomeBlockRendererComponent = ({
  block,
  railAutoplay,
  loading,
  error,
  onReload,
  onNavigate,
  onSelectProduct,
  onAddToCart,
}) => {
  const published = block.props
  if (published.type !== 'brand_spotlight' && published.type !== 'brand_promo') return null
  const items = mapProductsToHomeItems(published.products ?? [])
  return (
    <BrandSpotlightSection
      id={published.id}
      bannerTitle={
        published.type === 'brand_spotlight'
          ? published.titleText ?? resolvePairString(published.locale, published.bannerTitleEn, published.bannerTitleAr, '')
          : resolveBlockString(published.locale, published.title, '')
      }
      bannerSubtitle={
        published.type === 'brand_spotlight'
          ? resolvePairString(published.locale, published.bannerSubtitleEn, published.bannerSubtitleAr)
          : resolveBlockString(published.locale, published.subtitle)
      }
      bannerCtaLabel={
        published.type === 'brand_spotlight'
          ? published.ctaText ?? resolvePairString(published.locale, published.bannerCtaLabelEn, published.bannerCtaLabelAr, '')
          : resolveBlockString(published.locale, published.ctaLabel)
      }
      bannerHref={published.type === 'brand_spotlight' ? published.bannerHref : published.href}
      bannerImageUrl={published.type === 'brand_spotlight' ? published.bannerImageUrl : published.imageUrl}
      railTitle={
        published.type === 'brand_spotlight'
          ? resolvePairString(published.locale, published.railTitleEn, published.railTitleAr, '')
          : published.titleText ?? resolveBlockString(published.locale, published.title, '')
      }
      items={items}
      autoplay={railAutoplay?.brandSpotlights?.enabled !== false}
      autoplayMs={railAutoplay?.brandSpotlights?.autoplayMs ?? 5200}
      loading={loading}
      error={error}
      onRetry={onReload}
      onPressBanner={onNavigate}
      onPressProduct={(item) => onSelectProduct?.(item.id)}
      onAddToCart={(item) => onAddToCart?.(item.id)}
    />
  )
}

const OfferBannersBlockComponent: HomeBlockRendererComponent = ({ block, isDesktop, onNavigate }) => {
  const published = block.props
  if (published.type === 'offer_banners') {
    return (
      <OfferBannersGrid
        title={published.titleText}
        blocks={mapOfferBannerBlocks(published.locale, published.itemsLocalized ?? published.items)}
        isDesktop={isDesktop}
        onNavigate={onNavigate}
      />
    )
  }

  if (published.type === 'education_banner') {
    return (
      <OfferBannersGrid
        title={published.titleText ?? resolvePairString(published.locale, published.titleEn, published.titleAr, '')}
        blocks={mapOfferBannerBlocks(published.locale, [{
          id: published.id,
          title: published.titleText ?? '',
          subtitle: published.subtitleText,
          ctaLabel: published.ctaText,
          href: published.href,
          imageUrl: published.imageUrl,
        }])}
        isDesktop={isDesktop}
        onNavigate={onNavigate}
      />
    )
  }

  if (published.type === 'offer_stack' || published.type === 'sticky_listing_promo') {
    return (
      <OfferBannersGrid
        blocks={mapOfferBannerBlocks(
          published.locale,
          published.type === 'sticky_listing_promo'
            ? [{ id: published.id, title: resolveBlockString(published.locale, published.title, ''), subtitle: resolveBlockString(published.locale, published.subtitle), href: published.href }]
            : published.items.map((item) => ({ id: item.id, title: item.title, subtitle: item.subtitle, ctaLabel: item.badge, href: item.href })),
        )}
        isDesktop={isDesktop}
        onNavigate={onNavigate}
      />
    )
  }

  return null
}

const NewsletterBlockComponent: HomeBlockRendererComponent = ({ block }) => {
  const published = block.props
  if (published.type !== 'newsletter_cta') return null
  return (
    <NewsletterLoyaltyCta
      title={published.titleText ?? resolvePairString(published.locale, published.titleEn, published.titleAr, '')}
      subtitle={published.subtitleText ?? resolvePairString(published.locale, published.subtitleEn, published.subtitleAr)}
      ctaLabel={published.ctaText ?? resolvePairString(published.locale, published.ctaLabelEn, published.ctaLabelAr, '')}
    />
  )
}

const TopBrandsBlockComponent: HomeBlockRendererComponent = ({ block, onNavigate }) => {
  const published = block.props
  if (published.type !== 'top_brands') return null
  return (
    <TopBrandsGrid
      title={published.titleText ?? resolvePairString(published.locale, published.titleEn, published.titleAr, '')}
      items={mapBrandItems(published.items ?? [])}
      onPressItem={(item) => (item.href ? onNavigate?.(item.href) : undefined)}
    />
  )
}

const UgcGalleryBlockComponent: HomeBlockRendererComponent = ({ block, isDesktop, onNavigate }) => {
  const published = block.props
  if (published.type !== 'ugc_gallery') return null
  return (
    <TestimonialsBlock
      ugcItems={(published.items ?? []).map((item) => ({
        id: item.id,
        imageUrl: item.imageUrl,
        productId: item.productId,
        caption: resolveBlockString(published.locale, item.caption),
        href: item.href,
      }))}
      isDesktop={isDesktop}
      onNavigate={onNavigate}
    />
  )
}

const CategoryShortcutsBlockComponent: HomeBlockRendererComponent = ({ block, onNavigate }) => {
  const published = block.props
  if (published.type !== 'category_shortcuts') return null
  return (
    <CategoryRail
      title={published.titleText ?? resolveBlockString(published.locale, published.title, '')}
      items={mapCategoryItems(published.locale, published.items)}
      autoplay={false}
      onPressItem={(item) => (item.href ? onNavigate?.(item.href) : undefined)}
    />
  )
}

const EditorialHotspotBlockComponent: HomeBlockRendererComponent = ({
  block,
  isDesktop,
  locale = 'en',
  onNavigate,
  onSelectProduct,
  onAddToCart,
  onAddAllToCart,
}) => {
  const published = block.props
  if (published.type !== 'editorial_hotspot') return null
  const items = mapProductsToHomeItems(published.products ?? [])
  return items.length > 0 ? (
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
        section={{
          id: published.id,
          title: published.titleText ?? resolveBlockString(published.locale, published.title),
          subtitle: published.subtitleText ?? resolveBlockString(published.locale, published.subtitle),
          ctaLabel: published.ctaText ?? resolveBlockString(published.locale, published.ctaLabel),
          href: published.href,
          imageUrl: published.imageUrl,
          hotspots: (published.hotspots ?? []).map((hotspot) => ({
            id: hotspot.id,
            productId: hotspot.productId,
            xPercent: hotspot.xPercent,
            yPercent: hotspot.yPercent,
            label: resolveBlockString(published.locale, hotspot.label) || undefined,
          })),
          products: items,
        }}
        onNavigate={onNavigate}
        onSelectProduct={onSelectProduct}
        onAddToCart={onAddToCart}
        onAddAllToCart={onAddAllToCart}
        addAllToCartLabel={locale === 'ar' ? 'أضف الكل إلى السلة' : 'Add all to cart'}
      />
    </Box>
  ) : null
}

const PromoStripBlockComponent: HomeBlockRendererComponent = ({ block, tickerSpeedMs, onNavigate }) => {
  const published = block.props
  if (published.type !== 'promo_strip') return null
  return (
    <AnnouncementTicker
      items={[{ id: published.id, label: published.textValue ?? resolveBlockString(published.locale, published.text, ''), href: published.href }]}
      speedMs={tickerSpeedMs}
      onPressItem={onNavigate}
    />
  )
}

export function getBlockRegistryKey(type: string, version: string) {
  return `${type}:${version}`
}

export const blockRegistry = {
  [getBlockRegistryKey('hero_carousel', 'v1')]: HeroCarouselBlockComponent,
  [getBlockRegistryKey('hero', 'v1')]: HeroBlockComponent,
  [getBlockRegistryKey('flash_sale', 'v1')]: FlashSaleBlockComponent,
  [getBlockRegistryKey('product_slider', 'v1')]: ProductRailBlockComponent,
  [getBlockRegistryKey('personalized_rail', 'v1')]: ProductRailBlockComponent,
  [getBlockRegistryKey('brand_spotlight', 'v1')]: BrandSpotlightBlockComponent,
  [getBlockRegistryKey('brand_promo', 'v1')]: BrandSpotlightBlockComponent,
  [getBlockRegistryKey('offer_banners', 'v1')]: OfferBannersBlockComponent,
  [getBlockRegistryKey('education_banner', 'v1')]: OfferBannersBlockComponent,
  [getBlockRegistryKey('offer_stack', 'v1')]: OfferBannersBlockComponent,
  [getBlockRegistryKey('sticky_listing_promo', 'v1')]: OfferBannersBlockComponent,
  [getBlockRegistryKey('newsletter_cta', 'v1')]: NewsletterBlockComponent,
  [getBlockRegistryKey('top_brands', 'v1')]: TopBrandsBlockComponent,
  [getBlockRegistryKey('ugc_gallery', 'v1')]: UgcGalleryBlockComponent,
  [getBlockRegistryKey('category_shortcuts', 'v1')]: CategoryShortcutsBlockComponent,
  [getBlockRegistryKey('editorial_hotspot', 'v1')]: EditorialHotspotBlockComponent,
  [getBlockRegistryKey('promo_strip', 'v1')]: PromoStripBlockComponent,
} satisfies Record<string, HomeBlockRendererComponent>

export function getBlockComponent(block: RegisteredHomePageBlock) {
  return blockRegistry[getBlockRegistryKey(block.type, block.version)] ?? null
}

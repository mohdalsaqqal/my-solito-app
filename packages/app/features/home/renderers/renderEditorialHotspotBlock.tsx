import { Box } from '@real/ui/primitives'
import { EditorialHotspotSection } from '@real/ui/components'
import { resolveBlockString, mapProductsToHomeItems } from '../../../sections/blocks/block-types'
import { layout, componentTokens } from '@real/tokens'
import type { IndependentRenderSlot } from '../home-types'
import type { HomeProductItem } from '@real/ui/components/home/types'

type Props = {
  slot: IndependentRenderSlot
  onNavigate?: (href: string) => void
  onSelectProduct?: (productId: string) => void
  onAddToCart?: (productId: string) => void
  onAddAllToCart?: (productIds: string[]) => void
}

export function renderEditorialHotspotBlock({ slot, onNavigate, onSelectProduct, onAddToCart, onAddAllToCart }: Props) {
  const { block, profile } = slot
  if (block.type !== 'editorial_hotspot') return null

  const items: HomeProductItem[] = mapProductsToHomeItems(block.products ?? [])
  if (items.length === 0) return null

  const isDesktop = profile.breakpoint === 'desktop'

  return (
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
          id: block.id,
          title: block.titleText ?? resolveBlockString(block.locale, block.title),
          subtitle: block.subtitleText ?? resolveBlockString(block.locale, block.subtitle),
          ctaLabel: block.ctaText ?? resolveBlockString(block.locale, block.ctaLabel),
          href: block.href,
          imageUrl: block.imageUrl,
          hotspots: (block.hotspots ?? []).map((hotspot) => ({
            id: hotspot.id,
            productId: hotspot.productId,
            xPercent: hotspot.xPercent,
            yPercent: hotspot.yPercent,
            label: resolveBlockString(block.locale, hotspot.label) || undefined,
          })),
          products: items,
        }}
        onNavigate={onNavigate}
        onSelectProduct={onSelectProduct}
        onAddToCart={onAddToCart}
        onAddAllToCart={onAddAllToCart}
        addAllToCartLabel={block.locale === 'ar' ? 'أضف الكل إلى السلة' : 'Add all to cart'}
      />
    </Box>
  )
}

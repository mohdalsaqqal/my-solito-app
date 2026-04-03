import { ProductRail } from '@real/ui/components'
import { resolveBlockString, resolvePairString, mapProductsToProductCardModels } from '../../../sections/blocks/block-types'
import type { IndependentRenderSlot } from '../home-types'

type Props = {
  slot: IndependentRenderSlot
  loading: boolean
  error: string | null
  railAutoplayMs?: number
  onReload: () => void
  onNavigate?: (href: string) => void
  onSelectProduct?: (productId: string) => void
  onAddToCart?: (productId: string) => void
}

function resolveRailVariant(title: string | undefined) {
  const normalized = title?.trim().toLowerCase() ?? ''
  if (normalized.includes('flash') || normalized.includes('deal') || normalized.includes('offer')) return 'compact' as const
  if (normalized.includes('bundle') || normalized.includes('set') || normalized.includes('kit')) return 'featured' as const
  return 'default' as const
}

export function renderProductRailBlock({ slot, loading, error, railAutoplayMs = 5000, onReload, onNavigate, onSelectProduct, onAddToCart }: Props) {
  const { block } = slot
  if (block.type !== 'product_slider' && block.type !== 'personalized_rail') return null

  const href = 'href' in block && typeof block.href === 'string' ? block.href : ''
  const title =
    block.titleText ??
    (block.type === 'product_slider'
      ? resolveBlockString(block.locale, block.title, '')
      : resolvePairString(block.locale, block.titleEn, block.titleAr, ''))
  const items = mapProductsToProductCardModels(block.products ?? [], block.locale)

  return items.length > 0 ? (
    <ProductRail
      title={title}
      actionLabel={block.ctaText}
      actionHref={href}
      items={items}
      cardVariant={resolveRailVariant(title)}
      showFilterChips={block.type === 'product_slider'}
      autoplay
      autoplayMs={railAutoplayMs}
      loading={loading}
      error={error}
      onRetry={onReload}
      onPressAction={href ? () => onNavigate?.(href) : undefined}
      onSelectProduct={onSelectProduct}
      onAddToCart={onAddToCart}
    />
  ) : null
}

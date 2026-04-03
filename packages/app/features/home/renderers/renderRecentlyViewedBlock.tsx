import { HomeRecentlyViewedRail } from '@real/ui/components'
import { mapProductsToHomeItems } from '../../../sections/blocks/block-types'
import type { IndependentRenderSlot } from '../home-types'

type Props = {
  slot: IndependentRenderSlot
  onNavigate?: (href: string) => void
  onSelectProduct?: (productId: string) => void
  onAddToCart?: (productId: string) => void
}

export function renderRecentlyViewedBlock({ slot, onNavigate, onSelectProduct, onAddToCart }: Props) {
  const { block } = slot

  if (block.type !== 'cart_upsell_rail') return null

  const items = mapProductsToHomeItems(block.products ?? [])
  if (items.length === 0) return null

  return (
    <HomeRecentlyViewedRail
      items={items}
      onPressProduct={(item) => {
        if (item.href) onNavigate?.(item.href)
        else onSelectProduct?.(item.id)
      }}
      onAddToCart={(item) => onAddToCart?.(item.id)}
    />
  )
}

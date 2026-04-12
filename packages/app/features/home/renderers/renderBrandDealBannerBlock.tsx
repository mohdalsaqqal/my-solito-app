import { PromoDealBannerRow } from '@real/ui/components'
import type { PromoDealBannerItem } from '@real/ui/components'
import { resolvePairString } from '../../../sections/blocks/block-types'
import type { IndependentRenderSlot } from '../home-types'

type Props = {
  slot: IndependentRenderSlot
  onNavigate?: (href: string) => void
}

export function renderBrandDealBannerBlock({ slot, onNavigate }: Props) {
  const { block } = slot
  if (block.type !== 'brand_deal_banner') return null

  const title = resolvePairString(block.locale, block.titleEn, block.titleAr)

  const items: PromoDealBannerItem[] = block.items.map((item) => ({
    id: item.id,
    brandName: resolvePairString(block.locale, item.brandNameEn, item.brandNameAr, item.brandNameEn),
    preLabel: resolvePairString(block.locale, item.preLabelEn, item.preLabelAr),
    discountLabel: resolvePairString(block.locale, item.discountLabelEn, item.discountLabelAr, item.discountLabelEn),
    backgroundColor: item.backgroundColor,
    imageUrl: item.imageUrl,
    href: item.href,
  }))

  return (
    <PromoDealBannerRow
      title={title || undefined}
      items={items}
      onNavigate={onNavigate}
    />
  )
}

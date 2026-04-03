import { FlashSaleBand } from '@real/ui/components'
import { resolvePairString } from '../../../sections/blocks/block-types'
import type { IndependentRenderSlot } from '../home-types'

type Props = {
  slot: IndependentRenderSlot
  onNavigate?: (href: string) => void
}

export function renderFlashSaleBlock({ slot, onNavigate }: Props) {
  const { block } = slot
  if (block.type !== 'flash_sale') return null
  const href = block.href
  return (
    <FlashSaleBand
      offerText={block.titleText ?? resolvePairString(block.locale, block.titleEn, block.titleAr, '')}
      preLabel={resolvePairString(block.locale, block.urgencyLabelEn, block.urgencyLabelAr, '')}
      postLabel=''
      endsAtIso={block.timerEndsAt}
      ctaLabel={block.ctaText ?? resolvePairString(block.locale, block.ctaLabelEn, block.ctaLabelAr, '')}
      onPressCta={href ? () => onNavigate?.(href) : undefined}
    />
  )
}

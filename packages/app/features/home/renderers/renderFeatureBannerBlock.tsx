import { FeaturedCampaignSlot } from '@real/ui/components'
import { resolveBlockString } from '../../../sections/blocks/block-types'
import type { IndependentRenderSlot } from '../home-types'

type Props = {
  slot: IndependentRenderSlot
  onNavigate?: (href: string) => void
}

export function renderFeatureBannerBlock({ slot, onNavigate }: Props) {
  const { block } = slot

  if (block.type !== 'pdp_offer_cluster') return null

  const title = block.titleText ?? resolveBlockString(block.locale, block.title, '')
  const subtitle = block.subtitleText ?? resolveBlockString(block.locale, block.subtitle)
  const ctaLabel = block.ctaText ?? resolveBlockString(block.locale, block.badge)

  if (!title) return null

  return (
    <FeaturedCampaignSlot
      title={title}
      subtitle={subtitle}
      ctaLabel={ctaLabel}
      onPress={() => undefined}
    />
  )
}

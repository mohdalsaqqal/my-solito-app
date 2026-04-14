import { TopBrandsGrid, TestimonialsBlock } from '@real/ui/components'
import { resolveBlockString, resolvePairString, mapBrandItems } from '../../../sections/blocks/block-types'
import type { HomeUgcItem } from '@real/ui/components/home/types'
import type { IndependentRenderSlot } from '../home-types'

type Props = {
  slot: IndependentRenderSlot
  isDesktop: boolean
  onNavigate?: (href: string) => void
}

export function renderMiscBlock({ slot, isDesktop, onNavigate }: Props) {
  const { block } = slot

  // Newsletter CTA is handled by footer only — skip mid-page duplicate
  if (block.type === 'newsletter_cta') {
    return null
  }

  if (block.type === 'top_brands') {
    return (
      <TopBrandsGrid
        title={block.titleText ?? resolvePairString(block.locale, block.titleEn, block.titleAr, '')}
        items={mapBrandItems(block.items ?? [])}
        onPressItem={(item) => (item.href ? onNavigate?.(item.href) : undefined)}
      />
    )
  }

  if (block.type === 'ugc_gallery') {
    const ugcItems = (block.items ?? []).reduce<HomeUgcItem[]>((acc, item) => {
      if (!('imageUrl' in item) || typeof item.imageUrl !== 'string' || item.imageUrl.length === 0) return acc
      acc.push({
        id: item.id,
        imageUrl: item.imageUrl,
        productId: 'productId' in item ? item.productId : undefined,
        caption: resolveBlockString(block.locale, 'caption' in item ? item.caption : undefined),
        href: 'href' in item ? item.href : undefined,
      })
      return acc
    }, [])
    return (
      <TestimonialsBlock
        ugcItems={ugcItems}
        isDesktop={isDesktop}
        onNavigate={onNavigate}
      />
    )
  }

  return null
}

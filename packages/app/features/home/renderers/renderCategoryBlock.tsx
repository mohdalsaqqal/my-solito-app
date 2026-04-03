import { CategoryRail } from '@real/ui/components'
import { resolveBlockString } from '../../../sections/blocks/block-types'
import type { LocalizedString } from '@real/app/lib/types'
import type { IndependentRenderSlot } from '../home-types'

type Props = {
  slot: IndependentRenderSlot
  onNavigate?: (href: string) => void
}

function mapCategoryItems(
  locale: 'en' | 'ar',
  items: Array<{ id: string; label: string | LocalizedString; href?: string; imageUrl?: string }>,
) {
  return items.map((item) => ({
    id: item.id,
    label: resolveBlockString(locale, item.label),
    href: item.href,
    imageUrl: item.imageUrl,
  }))
}

export function renderCategoryBlock({ slot, onNavigate }: Props) {
  const { block } = slot
  if (block.type !== 'category_shortcuts') return null
  return (
    <CategoryRail
      title={block.titleText ?? resolveBlockString(block.locale, block.title, '')}
      items={mapCategoryItems(block.locale, block.items)}
      autoplay={false}
      onPressItem={(item) => (item.href ? onNavigate?.(item.href) : undefined)}
    />
  )
}

import { FaqAccordion } from '@real/ui/components'
import type { FaqAccordionItem } from '@real/ui/components'
import { resolvePairString } from '../../../sections/blocks/block-types'
import type { IndependentRenderSlot } from '../home-types'

type Props = {
  slot: IndependentRenderSlot
  onNavigate?: (href: string) => void
}

export function renderFaqAccordionBlock({ slot, onNavigate: _onNavigate }: Props) {
  const { block } = slot
  if (block.type !== 'faq_accordion') return null

  const title = resolvePairString(block.locale, block.titleEn, block.titleAr)

  const items: FaqAccordionItem[] = block.items.map((item) => ({
    id: item.id,
    question: resolvePairString(block.locale, item.questionEn, item.questionAr, ''),
    answer: resolvePairString(block.locale, item.answerEn, item.answerAr, ''),
  }))

  return <FaqAccordion title={title || undefined} items={items} />
}

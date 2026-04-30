import type { HomeBlock, ResolvedRenderSlot } from './home-types'
import type { LayoutProfile } from '@real/ui/responsive'

/**
 * Pure function — no hooks, fully testable.
 * Maps a flat list of CMS blocks + a LayoutProfile into resolved render slots.
 *
 * Desktop pairing rule:
 *   A promo_strip immediately preceding a hero_carousel (or hero) block
 *   is fused into a PairedRenderSlot so the two render as one visual unit.
 */
export function buildHomeLayout(
  blocks: HomeBlock[],
  profile: LayoutProfile,
): ResolvedRenderSlot[] {
  const slots: ResolvedRenderSlot[] = []
  let i = 0

  while (i < blocks.length) {
    const block = blocks[i]
    if (!block) {
      i++
      continue
    }
    const nextBlock = blocks[i + 1]
    const isDesktop = profile.breakpoint === 'desktop'

    if (
      isDesktop &&
      block.type === 'promo_strip' &&
      nextBlock &&
      (nextBlock.type === 'hero_carousel' || nextBlock.type === 'hero')
    ) {
      slots.push({
        kind: 'paired',
        strip: block,
        hero: nextBlock,
        profile,
        stripIndex: i,
        heroIndex: i + 1,
      })
      i += 2
      continue
    }

    slots.push({
      kind: 'independent',
      block,
      profile,
      index: i,
    })
    i++
  }

  return slots
}

import type { CMSHomeBlock } from '@real/app/lib/types'
import type { LayoutProfile } from '@real/ui/responsive'

// The canonical block shape used by the home layout engine — raw CMS block props
export type HomeBlock = CMSHomeBlock

// A single resolved render slot: one block + the layout context it will render in
export type HomeRenderSlot = {
  block: HomeBlock
  profile: LayoutProfile
  // Index into the original blocks array (stable key for React lists)
  index: number
}

// Paired slot: a promo_strip block visually fused to the next hero block on desktop
export type PairedRenderSlot = {
  kind: 'paired'
  strip: HomeBlock
  hero: HomeBlock
  profile: LayoutProfile
  stripIndex: number
  heroIndex: number
}

// Independent slot: a block that renders on its own
export type IndependentRenderSlot = {
  kind: 'independent'
  block: HomeBlock
  profile: LayoutProfile
  index: number
}

export type ResolvedRenderSlot = PairedRenderSlot | IndependentRenderSlot

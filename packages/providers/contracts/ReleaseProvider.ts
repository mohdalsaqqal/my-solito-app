import { ProviderResult } from './types'

export type ReleaseEnvironment = 'staging' | 'production'
export type ReleaseStatus = 'draft' | 'published'
export type ReleaseBlockType =
  | 'hero'
  | 'product_slider'
  | 'brand_promo'
  | 'promo_strip'
  | 'category_shortcuts'
  | 'offer_stack'
  | 'sticky_listing_promo'
  | 'hero_carousel'
  | 'flash_sale'
  | 'brand_spotlight'
  | 'offer_banners'
  | 'education_banner'
  | 'newsletter_cta'
  | 'top_brands'
  | 'ugc_gallery'
  | 'editorial_hotspot'
  | 'personalized_rail'
  | 'pdp_offer_cluster'
  | 'cart_upsell_rail'
  | 'brand_deal_banner'
  | 'faq_accordion'

export type ReleaseBlockRecord = {
  id: string
  releaseId: string
  position: number
  type: ReleaseBlockType
  payloadJson: unknown
  enabled: boolean
}

export type ReleaseRecord = {
  id: string
  name?: string
  environment: ReleaseEnvironment
  status: ReleaseStatus
  scheduledAt?: string
  createdAt: string
  updatedAt: string
}

export interface ReleaseProvider {
  list(environment?: ReleaseEnvironment): Promise<ProviderResult<ReleaseRecord[]>>
  create(input: { environment: ReleaseEnvironment; status?: ReleaseStatus; name?: string; scheduledAt?: string }): Promise<ProviderResult<ReleaseRecord>>
  update(
    id: string,
    input: Partial<{ environment: ReleaseEnvironment; status: ReleaseStatus; name: string; scheduledAt: string }>
  ): Promise<ProviderResult<ReleaseRecord>>
  publish(id: string): Promise<ProviderResult<ReleaseRecord>>
  getPublished(environment: ReleaseEnvironment): Promise<ProviderResult<ReleaseRecord>>
  getById(id: string): Promise<ProviderResult<ReleaseRecord>>
  listBlocks(releaseId: string): Promise<ProviderResult<ReleaseBlockRecord[]>>
  createBlock(input: {
    releaseId: string
    position: number
    type: ReleaseBlockType
    payloadJson: unknown
  }): Promise<ProviderResult<ReleaseBlockRecord>>
  updateBlock(
    id: string,
    input: Partial<{
      position: number
      type: ReleaseBlockType
      payloadJson: unknown
      enabled: boolean
    }>
  ): Promise<ProviderResult<ReleaseBlockRecord>>
  deleteBlock(id: string): Promise<ProviderResult<{ id: string; deleted: true }>>
}

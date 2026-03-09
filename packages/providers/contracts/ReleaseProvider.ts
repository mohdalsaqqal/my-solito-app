import { ProviderResult } from './types'

export type ReleaseEnvironment = 'staging' | 'production'
export type ReleaseStatus = 'draft' | 'published'
export type ReleaseBlockType = 'hero' | 'product_slider' | 'brand_promo' | 'promo_strip'

export type ReleaseBlockRecord = {
  id: string
  releaseId: string
  position: number
  type: ReleaseBlockType
  payloadJson: unknown
}

export type ReleaseRecord = {
  id: string
  environment: ReleaseEnvironment
  status: ReleaseStatus
  createdAt: string
  updatedAt: string
}

export interface ReleaseProvider {
  list(environment?: ReleaseEnvironment): Promise<ProviderResult<ReleaseRecord[]>>
  create(input: { environment: ReleaseEnvironment; status?: ReleaseStatus }): Promise<ProviderResult<ReleaseRecord>>
  update(
    id: string,
    input: Partial<{ environment: ReleaseEnvironment; status: ReleaseStatus }>
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
    }>
  ): Promise<ProviderResult<ReleaseBlockRecord>>
  deleteBlock(id: string): Promise<ProviderResult<{ id: string; deleted: true }>>
}

import { ProviderResult } from './types'

export type ReferralProgramMode = 'off' | 'influencers_only' | 'all_users'
export type ReferralAccessMode = 'link_only' | 'code_only' | 'link_and_code'

export type FollowerRewardType = 'percentage_discount' | 'fixed_discount' | 'loyalty_points' | 'none'
export type InfluencerRewardType = 'commission_percentage' | 'fixed_amount_per_order' | 'none'

export type ReferralRewardPolicy = {
  followerReward: {
    type: FollowerRewardType
    value: number
  }
  influencerReward: {
    type: InfluencerRewardType
    value: number
  }
  attributionWindowDays: number
  firstOrderOnly: boolean
  allowStackingWithPromotions: boolean
  minimumOrderAmount?: number
}

export type ReferralProgram = {
  mode: ReferralProgramMode
  accessMode: ReferralAccessMode
  policy: ReferralRewardPolicy
  updatedAt: string
}

export type ReferralActorType = 'customer' | 'influencer'

export type ReferralProfile = {
  id: string
  userId: string
  actorType: ReferralActorType
  code: string
  shareLink: string
  approved: boolean
  createdAt: string
}

export type ReferralValidationInput = {
  code?: string
  referralToken?: string
  actorUserId?: string
  cartSubtotal?: number
  currency?: string
}

export type ReferralValidationResult = {
  eligible: boolean
  programMode: ReferralProgramMode
  actorType?: ReferralActorType
  profileId?: string
  code?: string
  rewardPreview?: {
    type: FollowerRewardType
    value: number
  }
  reasonCode?: string
}

export type ReferralAttributionInput = {
  orderId: string
  profileId: string
  code: string
  actorUserId?: string
  referredUserId?: string
  subtotal: number
  currency: string
}

export type ReferralAttributionRecord = {
  id: string
  orderId: string
  profileId: string
  code: string
  status: 'pending' | 'approved' | 'rejected' | 'reversed'
  subtotal: number
  currency: string
  createdAt: string
}

export interface ReferralProvider {
  getProgram(): Promise<ProviderResult<ReferralProgram>>
  getProfile(userId: string): Promise<ProviderResult<ReferralProfile | null>>
  validate(input: ReferralValidationInput): Promise<ProviderResult<ReferralValidationResult>>
  createPendingAttribution(
    input: ReferralAttributionInput
  ): Promise<ProviderResult<ReferralAttributionRecord>>
}

export type ReferralProgramMode = 'off' | 'influencers_only' | 'all_users'
export type ReferralAccessMode = 'link_only' | 'code_only' | 'link_and_code'
export type ReferralActorType = 'customer' | 'influencer'

export type ReferralFollowerRewardType =
  | 'percentage_discount'
  | 'fixed_discount'
  | 'loyalty_points'
  | 'none'

export type ReferralInfluencerRewardType =
  | 'commission_percentage'
  | 'fixed_amount_per_order'
  | 'none'

export type ReferralRewardPolicy = {
  followerReward: {
    type: ReferralFollowerRewardType
    value: number
  }
  influencerReward: {
    type: ReferralInfluencerRewardType
    value: number
  }
  attributionWindowDays: number
  firstOrderOnly: boolean
  allowStackingWithPromotions: boolean
  minimumOrderAmount?: number
}

export type ReferralProgramSettings = {
  storeId: string
  mode: ReferralProgramMode
  accessMode: ReferralAccessMode
  policy: ReferralRewardPolicy
  updatedAt: string
}

export type ReferralProfile = {
  id: string
  storeId: string
  userId: string
  userEmail?: string
  actorType: ReferralActorType
  code: string
  shareLink: string
  approved: boolean
  displayName: string
  audienceCount?: number
  createdAt: string
}

export type ReferralLedgerStatus =
  | 'clicked'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'reversed'

export type ReferralLedgerEntry = {
  id: string
  storeId: string
  profileId: string
  referredUserId?: string
  orderId?: string
  code: string
  status: ReferralLedgerStatus
  currency: string
  subtotal?: number
  followerRewardValue?: number
  influencerRewardValue?: number
  createdAt: string
  updatedAt: string
}

export type ReferralRewardSummary = {
  followerReward: ReferralProgramSettings['policy']['followerReward']
  influencerReward: ReferralProgramSettings['policy']['influencerReward']
  attributionWindowDays: number
  firstOrderOnly: boolean
  allowStackingWithPromotions: boolean
  minimumOrderAmount?: number
}

export type ReferralAnalyticsSummary = {
  clicks: number
  attributedOrders: number
  pendingRewards: number
  approvedRewards: number
  totalEarnedValue: number
}

export type ReferralActivityItem = {
  id: string
  status: ReferralLedgerStatus
  createdAt: string
  orderId?: string
  subtotal?: number
  currency: string
  followerRewardValue?: number
  influencerRewardValue?: number
}

export type ReferralAccountSummary = {
  storeId: string
  programMode: ReferralProgramMode
  eligible: boolean
  visible: boolean
  actorType?: ReferralActorType
  code?: string
  shareLink?: string
  rewardSummary: ReferralRewardSummary
  analytics: ReferralAnalyticsSummary
  recentActivity: ReferralActivityItem[]
  creatorProfile?: {
    approved: boolean
    displayName: string
    audienceCount?: number
  }
}

export type ReferralValidationRequest = {
  code?: string
  cartSubtotal?: number
  currency?: string
}

export type ReferralValidationResponse = {
  eligible: boolean
  programMode: ReferralProgramMode
  actorType?: ReferralActorType
  profileId?: string
  code?: string
  reasonCode?: string
  rewardPreview?: ReferralProgramSettings['policy']['followerReward']
}

export type ReferralApplyRequest = {
  code?: string
  orderId?: string
  cartSubtotal?: number
  currency?: string
}

export type ReferralApplyResponse = {
  applied: boolean
  profileId?: string
  code?: string
  ledgerEntryId?: string
  status?: ReferralLedgerStatus
  rewardPreview?: ReferralProgramSettings['policy']['followerReward']
}

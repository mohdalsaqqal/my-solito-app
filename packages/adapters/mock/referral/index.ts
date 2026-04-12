import {
  ReferralAttributionInput,
  ReferralAttributionRecord,
  ReferralProfile,
  ReferralProgram,
  ReferralProvider,
  ReferralValidationInput,
  ReferralValidationResult,
} from '@real/providers/contracts'

const REFERRAL_PROGRAM: ReferralProgram = {
  mode: 'influencers_only',
  accessMode: 'link_and_code',
  policy: {
    followerReward: {
      type: 'percentage_discount',
      value: 10,
    },
    influencerReward: {
      type: 'commission_percentage',
      value: 12,
    },
    attributionWindowDays: 30,
    firstOrderOnly: true,
    allowStackingWithPromotions: false,
    minimumOrderAmount: 25,
  },
  updatedAt: new Date().toISOString(),
}

const REFERRAL_PROFILES: ReferralProfile[] = [
  {
    id: 'ref-prof-u-1',
    userId: 'u-1',
    actorType: 'influencer',
    code: 'GLOWWITHU1',
    shareLink: 'https://realcosmetics.local/r/GLOWWITHU1',
    approved: true,
    createdAt: new Date().toISOString(),
  },
]

function buildValidationResult(
  input: ReferralValidationInput,
  profile: ReferralProfile | undefined
): ReferralValidationResult {
  if (REFERRAL_PROGRAM.mode === 'off') {
    return {
      eligible: false,
      programMode: 'off',
      reasonCode: 'PROGRAM_DISABLED',
    }
  }

  if (!profile) {
    return {
      eligible: false,
      programMode: REFERRAL_PROGRAM.mode,
      reasonCode: 'REFERRAL_CODE_INVALID',
    }
  }

  if (REFERRAL_PROGRAM.mode === 'influencers_only' && !profile.approved) {
    return {
      eligible: false,
      programMode: REFERRAL_PROGRAM.mode,
      actorType: profile.actorType,
      profileId: profile.id,
      code: profile.code,
      reasonCode: 'REFERRAL_PROFILE_NOT_APPROVED',
    }
  }

  const subtotal = typeof input.cartSubtotal === 'number' ? input.cartSubtotal : undefined
  const minOrderAmount = REFERRAL_PROGRAM.policy.minimumOrderAmount
  if (typeof subtotal === 'number' && typeof minOrderAmount === 'number' && subtotal < minOrderAmount) {
    return {
      eligible: false,
      programMode: REFERRAL_PROGRAM.mode,
      actorType: profile.actorType,
      profileId: profile.id,
      code: profile.code,
      reasonCode: 'REFERRAL_MINIMUM_ORDER_NOT_MET',
    }
  }

  return {
    eligible: true,
    programMode: REFERRAL_PROGRAM.mode,
    actorType: profile.actorType,
    profileId: profile.id,
    code: profile.code,
    rewardPreview: {
      type: REFERRAL_PROGRAM.policy.followerReward.type,
      value: REFERRAL_PROGRAM.policy.followerReward.value,
    },
  }
}

export const mockReferralAdapter: ReferralProvider = {
  async getProgram() {
    return { ok: true, data: REFERRAL_PROGRAM }
  },

  async getProfile(userId: string) {
    const profile = REFERRAL_PROFILES.find((item) => item.userId === userId) ?? null
    return { ok: true, data: profile }
  },

  async validate(input: ReferralValidationInput) {
    const profile = REFERRAL_PROFILES.find((item) => item.code === input.code)
    return { ok: true, data: buildValidationResult(input, profile) }
  },

  async createPendingAttribution(input: ReferralAttributionInput) {
    const record: ReferralAttributionRecord = {
      id: `ref-attr-${input.orderId}`,
      orderId: input.orderId,
      profileId: input.profileId,
      code: input.code,
      status: 'pending',
      subtotal: input.subtotal,
      currency: input.currency,
      createdAt: new Date().toISOString(),
    }

    return { ok: true, data: record }
  },
}

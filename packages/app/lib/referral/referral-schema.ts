import {
  ReferralAccountSummary,
  ReferralActivityItem,
  ReferralAnalyticsSummary,
  ReferralApplyRequest,
  ReferralApplyResponse,
  ReferralLedgerEntry,
  ReferralProfile,
  ReferralProgramSettings,
  ReferralRewardSummary,
  ReferralValidationRequest,
  ReferralValidationResponse,
} from './referral-types'

export const DEFAULT_STORE_ID = 'default'

function safeNumber(value: unknown, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function normalizeMinimumOrderAmount(value: unknown) {
  return typeof value === 'number' && value > 0 ? value : undefined
}

export function normalizeReferralProgramSettings(input?: Partial<ReferralProgramSettings>): ReferralProgramSettings {
  return {
    storeId: typeof input?.storeId === 'string' && input.storeId ? input.storeId : DEFAULT_STORE_ID,
    mode:
      input?.mode === 'off' || input?.mode === 'influencers_only' || input?.mode === 'all_users'
        ? input.mode
        : 'influencers_only',
    accessMode:
      input?.accessMode === 'link_only' ||
      input?.accessMode === 'code_only' ||
      input?.accessMode === 'link_and_code'
        ? input.accessMode
        : 'link_and_code',
    policy: {
      followerReward: {
        type:
          input?.policy?.followerReward?.type === 'percentage_discount' ||
          input?.policy?.followerReward?.type === 'fixed_discount' ||
          input?.policy?.followerReward?.type === 'loyalty_points' ||
          input?.policy?.followerReward?.type === 'none'
            ? input.policy.followerReward.type
            : 'percentage_discount',
        value: safeNumber(input?.policy?.followerReward?.value, 10),
      },
      influencerReward: {
        type:
          input?.policy?.influencerReward?.type === 'commission_percentage' ||
          input?.policy?.influencerReward?.type === 'fixed_amount_per_order' ||
          input?.policy?.influencerReward?.type === 'none'
            ? input.policy.influencerReward.type
            : 'commission_percentage',
        value: safeNumber(input?.policy?.influencerReward?.value, 12),
      },
      attributionWindowDays: Math.max(1, Math.floor(safeNumber(input?.policy?.attributionWindowDays, 30))),
      firstOrderOnly: input?.policy?.firstOrderOnly !== false,
      allowStackingWithPromotions: input?.policy?.allowStackingWithPromotions === true,
      minimumOrderAmount: normalizeMinimumOrderAmount(input?.policy?.minimumOrderAmount),
    },
    updatedAt: typeof input?.updatedAt === 'string' ? input.updatedAt : new Date().toISOString(),
  }
}

export function normalizeReferralCode(code?: string | null) {
  return (code ?? '').trim().toUpperCase()
}

export function normalizeReferralValidationRequest(body: unknown): ReferralValidationRequest {
  const input = body && typeof body === 'object' ? (body as Partial<ReferralValidationRequest>) : {}
  return {
    code: normalizeReferralCode(input.code),
    cartSubtotal: typeof input.cartSubtotal === 'number' ? input.cartSubtotal : undefined,
    currency: typeof input.currency === 'string' ? input.currency : undefined,
  }
}

export function normalizeReferralApplyRequest(body: unknown): ReferralApplyRequest {
  const input = body && typeof body === 'object' ? (body as Partial<ReferralApplyRequest>) : {}
  return {
    code: normalizeReferralCode(input.code),
    orderId: typeof input.orderId === 'string' ? input.orderId.trim() : undefined,
    cartSubtotal: typeof input.cartSubtotal === 'number' ? input.cartSubtotal : undefined,
    currency: typeof input.currency === 'string' ? input.currency : undefined,
  }
}

export function isReferralProfileVisible(
  program: ReferralProgramSettings,
  profile: ReferralProfile | null
) {
  if (program.mode === 'off') {
    return false
  }
  if (program.mode === 'all_users') {
    return true
  }
  return Boolean(profile?.approved)
}

export function buildReferralRewardSummary(program: ReferralProgramSettings): ReferralRewardSummary {
  return {
    followerReward: program.policy.followerReward,
    influencerReward: program.policy.influencerReward,
    attributionWindowDays: program.policy.attributionWindowDays,
    firstOrderOnly: program.policy.firstOrderOnly,
    allowStackingWithPromotions: program.policy.allowStackingWithPromotions,
    minimumOrderAmount: program.policy.minimumOrderAmount,
  }
}

export function buildReferralAnalyticsSummary(entries: ReferralLedgerEntry[]): ReferralAnalyticsSummary {
  return entries.reduce<ReferralAnalyticsSummary>(
    (summary, entry) => {
      if (entry.status === 'clicked') {
        summary.clicks += 1
      }
      if (entry.status === 'pending' || entry.status === 'approved') {
        summary.attributedOrders += 1
      }
      if (entry.status === 'pending') {
        summary.pendingRewards += 1
      }
      if (entry.status === 'approved') {
        summary.approvedRewards += 1
      }
      summary.totalEarnedValue += safeNumber(entry.influencerRewardValue, 0)
      return summary
    },
    {
      clicks: 0,
      attributedOrders: 0,
      pendingRewards: 0,
      approvedRewards: 0,
      totalEarnedValue: 0,
    }
  )
}

export function toReferralActivityItems(entries: ReferralLedgerEntry[]): ReferralActivityItem[] {
  return entries
    .slice()
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, 8)
    .map((entry) => ({
      id: entry.id,
      status: entry.status,
      createdAt: entry.createdAt,
      orderId: entry.orderId,
      subtotal: entry.subtotal,
      currency: entry.currency,
      followerRewardValue: entry.followerRewardValue,
      influencerRewardValue: entry.influencerRewardValue,
    }))
}

export function buildReferralAccountSummary(input: {
  program: ReferralProgramSettings
  profile: ReferralProfile | null
  entries: ReferralLedgerEntry[]
}): ReferralAccountSummary {
  const visible = isReferralProfileVisible(input.program, input.profile)

  return {
    storeId: input.program.storeId,
    programMode: input.program.mode,
    eligible: visible,
    visible,
    actorType: input.profile?.actorType,
    code: visible ? input.profile?.code : undefined,
    shareLink: visible ? input.profile?.shareLink : undefined,
    rewardSummary: buildReferralRewardSummary(input.program),
    analytics: buildReferralAnalyticsSummary(input.entries),
    recentActivity: toReferralActivityItems(input.entries),
    creatorProfile: input.profile
      ? {
          approved: input.profile.approved,
          displayName: input.profile.displayName,
          audienceCount: input.profile.audienceCount,
        }
      : undefined,
  }
}

export function validateReferralRequest(input: {
  request: ReferralValidationRequest
  program: ReferralProgramSettings
  profile: ReferralProfile | null
}): ReferralValidationResponse {
  if (input.program.mode === 'off') {
    return {
      eligible: false,
      programMode: input.program.mode,
      reasonCode: 'PROGRAM_DISABLED',
    }
  }

  if (!input.request.code) {
    return {
      eligible: false,
      programMode: input.program.mode,
      reasonCode: 'REFERRAL_CODE_REQUIRED',
    }
  }

  if (!input.profile || normalizeReferralCode(input.profile.code) !== input.request.code) {
    return {
      eligible: false,
      programMode: input.program.mode,
      reasonCode: 'REFERRAL_CODE_INVALID',
    }
  }

  if (input.program.mode === 'influencers_only' && !input.profile.approved) {
    return {
      eligible: false,
      programMode: input.program.mode,
      actorType: input.profile.actorType,
      profileId: input.profile.id,
      code: input.profile.code,
      reasonCode: 'REFERRAL_PROFILE_NOT_APPROVED',
    }
  }

  if (
    typeof input.request.cartSubtotal === 'number' &&
    typeof input.program.policy.minimumOrderAmount === 'number' &&
    input.request.cartSubtotal < input.program.policy.minimumOrderAmount
  ) {
    return {
      eligible: false,
      programMode: input.program.mode,
      actorType: input.profile.actorType,
      profileId: input.profile.id,
      code: input.profile.code,
      reasonCode: 'REFERRAL_MINIMUM_ORDER_NOT_MET',
    }
  }

  return {
    eligible: true,
    programMode: input.program.mode,
    actorType: input.profile.actorType,
    profileId: input.profile.id,
    code: input.profile.code,
    rewardPreview: input.program.policy.followerReward,
  }
}

export function buildReferralApplyResponse(input: {
  validation: ReferralValidationResponse
  ledgerEntryId?: string
}): ReferralApplyResponse {
  if (!input.validation.eligible) {
    return {
      applied: false,
      code: input.validation.code,
    }
  }

  return {
    applied: true,
    profileId: input.validation.profileId,
    code: input.validation.code,
    ledgerEntryId: input.ledgerEntryId,
    status: 'pending',
    rewardPreview: input.validation.rewardPreview,
  }
}

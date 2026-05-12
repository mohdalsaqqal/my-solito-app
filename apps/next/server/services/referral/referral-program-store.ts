import { prisma } from '../../lib/prisma'
import { ReferralProgramSettings } from '@real/app/lib/referral/referral-types'
import { DEFAULT_STORE_ID, normalizeReferralProgramSettings } from '@real/app/lib/referral/referral-schema'

function rowToSettings(row: {
  storeId: string; mode: string; accessMode: string
  followerRewardType: string; followerRewardValue: number; followerRewardCurrency: string
  influencerRewardType: string; influencerRewardValue: number; influencerRewardCurrency: string
  attributionWindowDays: number; firstOrderOnly: boolean
  allowStackingWithPromotions: boolean; minimumOrderAmount: number; minimumOrderCurrency: string
}): ReferralProgramSettings {
  return normalizeReferralProgramSettings({
    storeId: row.storeId,
    mode: row.mode as ReferralProgramSettings['mode'],
    accessMode: row.accessMode as ReferralProgramSettings['accessMode'],
    policy: {
      followerReward: {
        type: row.followerRewardType as ReferralProgramSettings['policy']['followerReward']['type'],
        value: row.followerRewardValue,
      },
      influencerReward: {
        type: row.influencerRewardType as ReferralProgramSettings['policy']['influencerReward']['type'],
        value: row.influencerRewardValue,
      },
      attributionWindowDays: row.attributionWindowDays,
      firstOrderOnly: row.firstOrderOnly,
      allowStackingWithPromotions: row.allowStackingWithPromotions,
      minimumOrderAmount: row.minimumOrderAmount,
    },
  })
}

const DEFAULT_PROGRAM = normalizeReferralProgramSettings({
  storeId: DEFAULT_STORE_ID,
  mode: 'influencers_only',
  accessMode: 'link_and_code',
  policy: {
    followerReward: { type: 'percentage_discount', value: 10 },
    influencerReward: { type: 'commission_percentage', value: 12 },
    attributionWindowDays: 30,
    firstOrderOnly: true,
    allowStackingWithPromotions: false,
    minimumOrderAmount: 25,
  },
})

export async function readReferralProgramSettings(storeId = DEFAULT_STORE_ID): Promise<ReferralProgramSettings> {
  const created = await prisma.referralProgram.upsert({
    where: {
      tenantId_storeId: { tenantId: 'default', storeId },
    },
    update: {},
    create: {
      storeId,
      mode: DEFAULT_PROGRAM.mode,
      accessMode: DEFAULT_PROGRAM.accessMode,
      followerRewardType: DEFAULT_PROGRAM.policy.followerReward.type,
      followerRewardValue: DEFAULT_PROGRAM.policy.followerReward.value,
      influencerRewardType: DEFAULT_PROGRAM.policy.influencerReward.type,
      influencerRewardValue: DEFAULT_PROGRAM.policy.influencerReward.value,
      attributionWindowDays: DEFAULT_PROGRAM.policy.attributionWindowDays,
      firstOrderOnly: DEFAULT_PROGRAM.policy.firstOrderOnly,
      allowStackingWithPromotions: DEFAULT_PROGRAM.policy.allowStackingWithPromotions,
      minimumOrderAmount: DEFAULT_PROGRAM.policy.minimumOrderAmount ?? 0,
    },
  })
  return rowToSettings(created)
}

export async function writeReferralProgramSettings(settings: ReferralProgramSettings) {
  const normalized = normalizeReferralProgramSettings(settings)
  await prisma.referralProgram.upsert({
    where: {
      tenantId_storeId: { tenantId: 'default', storeId: normalized.storeId ?? DEFAULT_STORE_ID },
    },
    create: {
      storeId: normalized.storeId ?? DEFAULT_STORE_ID,
      mode: normalized.mode,
      accessMode: normalized.accessMode,
      followerRewardType: normalized.policy.followerReward.type,
      followerRewardValue: normalized.policy.followerReward.value,
      influencerRewardType: normalized.policy.influencerReward.type,
      influencerRewardValue: normalized.policy.influencerReward.value,
      attributionWindowDays: normalized.policy.attributionWindowDays,
      firstOrderOnly: normalized.policy.firstOrderOnly,
      allowStackingWithPromotions: normalized.policy.allowStackingWithPromotions,
      minimumOrderAmount: normalized.policy.minimumOrderAmount ?? 0,
    },
    update: {
      mode: normalized.mode,
      accessMode: normalized.accessMode,
      followerRewardType: normalized.policy.followerReward.type,
      followerRewardValue: normalized.policy.followerReward.value,
      influencerRewardType: normalized.policy.influencerReward.type,
      influencerRewardValue: normalized.policy.influencerReward.value,
      attributionWindowDays: normalized.policy.attributionWindowDays,
      firstOrderOnly: normalized.policy.firstOrderOnly,
      allowStackingWithPromotions: normalized.policy.allowStackingWithPromotions,
      minimumOrderAmount: normalized.policy.minimumOrderAmount ?? 0,
    },
  })
}

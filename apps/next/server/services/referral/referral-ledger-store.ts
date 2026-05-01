import { prisma } from '../../lib/prisma'
import { ReferralLedgerEntry } from '@real/app/lib/referral/referral-types'
import { DEFAULT_STORE_ID } from '@real/app/lib/referral/referral-schema'

function toEntry(row: {
  id: string; storeId: string; profileId: string; referredUserId: string | null
  orderId: string | null; code: string; status: string; currency: string
  subtotal: number; followerRewardValue: number; influencerRewardValue: number
  createdAt: Date; updatedAt: Date
}): ReferralLedgerEntry {
  return {
    id: row.id,
    storeId: row.storeId,
    profileId: row.profileId,
    referredUserId: row.referredUserId ?? undefined,
    orderId: row.orderId ?? undefined,
    code: row.code,
    status: row.status as ReferralLedgerEntry['status'],
    currency: row.currency,
    subtotal: row.subtotal,
    followerRewardValue: row.followerRewardValue,
    influencerRewardValue: row.influencerRewardValue,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

export async function listReferralLedgerEntries(storeId = DEFAULT_STORE_ID) {
  const rows = await prisma.referralLedgerEntry.findMany({
    where: { storeId },
    orderBy: { createdAt: 'desc' },
  })
  return rows.map(toEntry)
}

export async function listReferralLedgerEntriesByProfile(profileId: string, storeId = DEFAULT_STORE_ID) {
  const rows = await prisma.referralLedgerEntry.findMany({
    where: { profileId, storeId },
    orderBy: { createdAt: 'desc' },
  })
  return rows.map(toEntry)
}

export async function createReferralLedgerEntry(
  input: Omit<ReferralLedgerEntry, 'id' | 'createdAt' | 'updatedAt'>
) {
  const row = await prisma.referralLedgerEntry.create({
    data: {
      id: `ref-ledger-${Date.now()}`,
      storeId: input.storeId ?? DEFAULT_STORE_ID,
      profileId: input.profileId,
      referredUserId: input.referredUserId ?? null,
      orderId: input.orderId ?? null,
      code: input.code,
      status: input.status ?? 'pending',
      currency: input.currency ?? 'SAR',
      subtotal: input.subtotal ?? 0,
      followerRewardValue: input.followerRewardValue ?? 0,
      influencerRewardValue: input.influencerRewardValue ?? 0,
    },
  })
  return toEntry(row)
}

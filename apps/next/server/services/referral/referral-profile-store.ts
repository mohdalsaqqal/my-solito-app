import { prisma } from '../../lib/prisma'
import { ReferralProfile } from '@real/app/lib/referral/referral-types'
import { DEFAULT_STORE_ID } from '@real/app/lib/referral/referral-schema'

function slugifyCodePart(input: string) {
  return input
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '')
    .slice(0, 8)
}

async function uniqueReferralCode(displayName: string, userId: string) {
  const base = slugifyCodePart(displayName) || slugifyCodePart(userId) || 'REFERRAL'
  let candidate = base
  let attempt = 1
  while (true) {
    const existing = await prisma.referralProfile.findUnique({ where: { code: candidate } })
    if (!existing) return candidate
    attempt += 1
    candidate = `${base}${attempt}`.slice(0, 12)
  }
}

function toProfile(row: {
  id: string; tenantId: string; storeId: string; userId: string; userEmail: string
  actorType: string; code: string; shareLink: string; approved: boolean
  displayName: string; audienceCount: number; createdAt: Date
}): ReferralProfile {
  return {
    id: row.id,
    storeId: row.storeId,
    userId: row.userId,
    userEmail: row.userEmail,
    actorType: row.actorType as ReferralProfile['actorType'],
    code: row.code,
    shareLink: row.shareLink,
    approved: row.approved,
    displayName: row.displayName,
    audienceCount: row.audienceCount,
    createdAt: row.createdAt.toISOString(),
  }
}

export async function listReferralProfiles(storeId = DEFAULT_STORE_ID) {
  const rows = await prisma.referralProfile.findMany({ where: { storeId } })
  return rows.map(toProfile)
}

export async function getReferralProfileByUserId(userId: string, storeId = DEFAULT_STORE_ID) {
  const row = await prisma.referralProfile.findFirst({
    where: { userId, storeId },
  })
  return row ? toProfile(row) : null
}

export async function getReferralProfileByIdentity(
  input: { userId?: string; email?: string },
  storeId = DEFAULT_STORE_ID,
) {
  const email = input.email?.trim().toLowerCase()
  if (input.userId) {
    const byUser = await getReferralProfileByUserId(input.userId, storeId)
    if (byUser) return byUser
  }
  if (email) {
    const row = await prisma.referralProfile.findFirst({
      where: { storeId, userEmail: { contains: email, mode: 'insensitive' } },
    })
    if (row) return toProfile(row)
  }
  return null
}

export async function getReferralProfileByCode(code: string, storeId = DEFAULT_STORE_ID) {
  const row = await prisma.referralProfile.findFirst({
    where: { code: { equals: code, mode: 'insensitive' }, storeId },
  })
  return row ? toProfile(row) : null
}

export async function getReferralProfileById(id: string, storeId = DEFAULT_STORE_ID) {
  const row = await prisma.referralProfile.findFirst({ where: { id, storeId } })
  return row ? toProfile(row) : null
}

export async function updateReferralProfile(
  id: string,
  input: Partial<
    Pick<ReferralProfile, 'actorType' | 'approved' | 'displayName' | 'audienceCount' | 'code' | 'shareLink'>
  >,
) {
  const existing = await prisma.referralProfile.findUnique({ where: { id } })
  if (!existing) return null

  const row = await prisma.referralProfile.update({
    where: { id },
    data: {
      actorType: input.actorType ?? existing.actorType,
      approved: typeof input.approved === 'boolean' ? input.approved : existing.approved,
      displayName: input.displayName?.trim() || existing.displayName,
      audienceCount: typeof input.audienceCount === 'number' && Number.isFinite(input.audienceCount)
        ? input.audienceCount : existing.audienceCount,
      code: input.code?.trim().toUpperCase() || existing.code,
      shareLink: input.shareLink?.trim() || existing.shareLink,
    },
  })
  return toProfile(row)
}

export async function createReferralProfile(input: {
  userId: string
  userEmail?: string
  displayName: string
  actorType: ReferralProfile['actorType']
  approved?: boolean
  audienceCount?: number
  shareLinkBase?: string
  storeId?: string
}) {
  const storeId = input.storeId ?? DEFAULT_STORE_ID
  const existing = await prisma.referralProfile.findFirst({
    where: { userId: input.userId, storeId },
  })
  if (existing) {
    return { created: false as const, profile: toProfile(existing) }
  }

  const code = await uniqueReferralCode(input.displayName, input.userId)
  const shareLinkBase = (input.shareLinkBase?.trim().replace(/\/$/, '') || 'https://realcosmetics.local').replace(/\/$/, '')
  const shareLink = `${shareLinkBase}/r/${code}`

  const row = await prisma.referralProfile.create({
    data: {
      storeId,
      userId: input.userId,
      userEmail: input.userEmail ?? '',
      actorType: input.actorType,
      code,
      shareLink,
      approved: input.approved ?? false,
      displayName: input.displayName,
      audienceCount: input.audienceCount ?? 0,
    },
  })
  return { created: true as const, profile: toProfile(row) }
}

export async function regenerateReferralProfileCode(
  id: string,
  input?: { displayName?: string; shareLinkBase?: string },
) {
  const existing = await prisma.referralProfile.findUnique({ where: { id } })
  if (!existing) return null

  const code = await uniqueReferralCode(input?.displayName ?? existing.displayName, existing.userId)
  const shareLinkBase = (input?.shareLinkBase?.trim().replace(/\/$/, '') || 'https://realcosmetics.local').replace(/\/$/, '')
  const shareLink = `${shareLinkBase}/r/${code}`

  const row = await prisma.referralProfile.update({
    where: { id },
    data: { code, shareLink },
  })
  return toProfile(row)
}

// Legacy export for compatibility
export async function writeReferralProfiles(_profiles: ReferralProfile[]) {
  // No-op: Prisma handles persistence automatically
}

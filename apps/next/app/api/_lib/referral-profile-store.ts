import fs from 'node:fs/promises'
import path from 'node:path'
import { ReferralProfile } from '@real/app/lib/referral/referral-types'
import { DEFAULT_STORE_ID } from '@real/app/lib/referral/referral-schema'

const STORAGE_DIR = path.join(process.cwd(), '.data')
const STORAGE_FILE = path.join(STORAGE_DIR, 'referral-profile-store.json')

function buildInitialProfiles(): ReferralProfile[] {
  return [
    {
      id: 'ref-prof-u-1',
      storeId: DEFAULT_STORE_ID,
      userId: 'u-1',
      userEmail: 'user@realcosmetics.local',
      actorType: 'influencer',
      code: 'GLOWWITHU1',
      shareLink: 'https://realcosmetics.local/r/GLOWWITHU1',
      approved: true,
      displayName: 'Customer User',
      audienceCount: 18200,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'ref-prof-u-2',
      storeId: DEFAULT_STORE_ID,
      userId: 'u-2',
      userEmail: 'admin@realcosmetics.local',
      actorType: 'customer',
      code: 'SHAREU2',
      shareLink: 'https://realcosmetics.local/r/SHAREU2',
      approved: false,
      displayName: 'Customer Two',
      audienceCount: 120,
      createdAt: new Date().toISOString(),
    },
  ]
}

async function readProfiles(): Promise<ReferralProfile[]> {
  try {
    const raw = await fs.readFile(STORAGE_FILE, 'utf8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as ReferralProfile[]) : buildInitialProfiles()
  } catch {
    return buildInitialProfiles()
  }
}

function slugifyCodePart(input: string) {
  return input
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '')
    .slice(0, 8)
}

function uniqueReferralCode(
  profiles: ReferralProfile[],
  displayName: string,
  userId: string,
) {
  const base = slugifyCodePart(displayName) || slugifyCodePart(userId) || 'REFERRAL'
  let candidate = base
  let attempt = 1
  const existing = new Set(profiles.map((profile) => profile.code.toUpperCase()))
  while (existing.has(candidate)) {
    attempt += 1
    candidate = `${base}${attempt}`.slice(0, 12)
  }
  return candidate
}

export async function listReferralProfiles(storeId = DEFAULT_STORE_ID) {
  const profiles = await readProfiles()
  return profiles.filter((profile) => profile.storeId === storeId)
}

export async function getReferralProfileByUserId(userId: string, storeId = DEFAULT_STORE_ID) {
  const profiles = await listReferralProfiles(storeId)
  return profiles.find((profile) => profile.userId === userId) ?? null
}

export async function getReferralProfileByIdentity(
  input: { userId?: string; email?: string },
  storeId = DEFAULT_STORE_ID,
) {
  const profiles = await listReferralProfiles(storeId)
  const email = input.email?.trim().toLowerCase()
  return (
    profiles.find((profile) => {
      if (input.userId && profile.userId === input.userId) return true
      if (email && profile.userEmail?.trim().toLowerCase() === email) return true
      return false
    }) ?? null
  )
}

export async function getReferralProfileByCode(code: string, storeId = DEFAULT_STORE_ID) {
  const profiles = await listReferralProfiles(storeId)
  return profiles.find((profile) => profile.code.toUpperCase() === code.toUpperCase()) ?? null
}

export async function getReferralProfileById(id: string, storeId = DEFAULT_STORE_ID) {
  const profiles = await listReferralProfiles(storeId)
  return profiles.find((profile) => profile.id === id) ?? null
}

export async function updateReferralProfile(
  id: string,
  input: Partial<
    Pick<
      ReferralProfile,
      'actorType' | 'approved' | 'displayName' | 'audienceCount' | 'code' | 'shareLink'
    >
  >
) {
  const profiles = await readProfiles()
  let updatedProfile: ReferralProfile | null = null

  const nextProfiles = profiles.map((profile) => {
    if (profile.id !== id) {
      return profile
    }

    updatedProfile = {
      ...profile,
      actorType: input.actorType ?? profile.actorType,
      approved: typeof input.approved === 'boolean' ? input.approved : profile.approved,
      displayName: input.displayName?.trim() || profile.displayName,
      audienceCount:
        typeof input.audienceCount === 'number' && Number.isFinite(input.audienceCount)
          ? input.audienceCount
          : profile.audienceCount,
      code: input.code?.trim().toUpperCase() || profile.code,
      shareLink: input.shareLink?.trim() || profile.shareLink,
    }

    return updatedProfile
  })

  if (!updatedProfile) {
    return null
  }

  await writeReferralProfiles(nextProfiles)
  return updatedProfile
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
  const profiles = await readProfiles()
  const storeId = input.storeId ?? DEFAULT_STORE_ID
  const existing = profiles.find(
    (profile) => profile.storeId === storeId && profile.userId === input.userId,
  )
  if (existing) {
    return { created: false as const, profile: existing }
  }

  const code = uniqueReferralCode(profiles, input.displayName, input.userId)
  const shareLinkBase = (input.shareLinkBase?.trim().replace(/\/$/, '') || 'https://realcosmetics.local').replace(/\/$/, '')

  const profile: ReferralProfile = {
    id: `ref-prof-${input.userId}`,
    storeId,
    userId: input.userId,
    userEmail: input.userEmail?.trim().toLowerCase() || undefined,
    actorType: input.actorType,
    code,
    shareLink: `${shareLinkBase}/r/${code}`,
    approved: Boolean(input.approved),
    displayName: input.displayName.trim() || input.userId,
    audienceCount:
      typeof input.audienceCount === 'number' && Number.isFinite(input.audienceCount)
        ? input.audienceCount
        : undefined,
    createdAt: new Date().toISOString(),
  }

  await writeReferralProfiles([...profiles, profile])
  return { created: true as const, profile }
}

export async function regenerateReferralProfileCode(
  id: string,
  input?: { shareLinkBase?: string },
) {
  const profiles = await readProfiles()
  let updatedProfile: ReferralProfile | null = null
  const shareLinkBase = (input?.shareLinkBase?.trim().replace(/\/$/, '') || 'https://realcosmetics.local').replace(/\/$/, '')

  const nextProfiles = profiles.map((profile) => {
    if (profile.id !== id) return profile
    const code = uniqueReferralCode(
      profiles.filter((candidate) => candidate.id !== id),
      profile.displayName,
      profile.userId,
    )
    updatedProfile = {
      ...profile,
      code,
      shareLink: `${shareLinkBase}/r/${code}`,
    }
    return updatedProfile
  })

  if (!updatedProfile) return null
  await writeReferralProfiles(nextProfiles)
  return updatedProfile
}

export async function writeReferralProfiles(profiles: ReferralProfile[]) {
  await fs.mkdir(STORAGE_DIR, { recursive: true })
  await fs.writeFile(STORAGE_FILE, JSON.stringify(profiles, null, 2), 'utf8')
}

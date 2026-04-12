import fs from 'node:fs/promises'
import path from 'node:path'
import { ReferralLedgerEntry } from '@real/app/lib/referral/referral-types'
import { DEFAULT_STORE_ID } from '@real/app/lib/referral/referral-schema'

const STORAGE_DIR = path.join(process.cwd(), '.data')
const STORAGE_FILE = path.join(STORAGE_DIR, 'referral-ledger-store.json')

function buildInitialLedger(): ReferralLedgerEntry[] {
  const now = Date.now()
  return [
    {
      id: 'ref-ledger-click-u-1',
      storeId: DEFAULT_STORE_ID,
      profileId: 'ref-prof-u-1',
      referredUserId: 'guest-1',
      code: 'GLOWWITHU1',
      status: 'clicked',
      currency: 'USD',
      createdAt: new Date(now - 1000 * 60 * 60 * 24 * 3).toISOString(),
      updatedAt: new Date(now - 1000 * 60 * 60 * 24 * 3).toISOString(),
    },
    {
      id: 'ref-ledger-pending-u-1',
      storeId: DEFAULT_STORE_ID,
      profileId: 'ref-prof-u-1',
      referredUserId: 'u-3',
      orderId: 'ord-u-3-1',
      code: 'GLOWWITHU1',
      status: 'pending',
      currency: 'USD',
      subtotal: 84,
      followerRewardValue: 8.4,
      influencerRewardValue: 10.08,
      createdAt: new Date(now - 1000 * 60 * 60 * 18).toISOString(),
      updatedAt: new Date(now - 1000 * 60 * 60 * 18).toISOString(),
    },
    {
      id: 'ref-ledger-approved-u-1',
      storeId: DEFAULT_STORE_ID,
      profileId: 'ref-prof-u-1',
      referredUserId: 'u-4',
      orderId: 'ord-u-4-1',
      code: 'GLOWWITHU1',
      status: 'approved',
      currency: 'USD',
      subtotal: 120,
      followerRewardValue: 12,
      influencerRewardValue: 14.4,
      createdAt: new Date(now - 1000 * 60 * 60 * 24 * 6).toISOString(),
      updatedAt: new Date(now - 1000 * 60 * 60 * 24 * 5).toISOString(),
    },
  ]
}

async function readLedgerEntries(): Promise<ReferralLedgerEntry[]> {
  try {
    const raw = await fs.readFile(STORAGE_FILE, 'utf8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as ReferralLedgerEntry[]) : buildInitialLedger()
  } catch {
    return buildInitialLedger()
  }
}

async function writeLedgerEntries(entries: ReferralLedgerEntry[]) {
  await fs.mkdir(STORAGE_DIR, { recursive: true })
  await fs.writeFile(STORAGE_FILE, JSON.stringify(entries, null, 2), 'utf8')
}

export async function listReferralLedgerEntries(storeId = DEFAULT_STORE_ID) {
  const entries = await readLedgerEntries()
  return entries.filter((entry) => entry.storeId === storeId)
}

export async function listReferralLedgerEntriesByProfile(profileId: string, storeId = DEFAULT_STORE_ID) {
  const entries = await listReferralLedgerEntries(storeId)
  return entries.filter((entry) => entry.profileId === profileId)
}

export async function createReferralLedgerEntry(
  input: Omit<ReferralLedgerEntry, 'id' | 'createdAt' | 'updatedAt'>
) {
  const entries = await readLedgerEntries()
  const now = new Date().toISOString()
  const next: ReferralLedgerEntry = {
    ...input,
    id: `ref-ledger-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  }
  await writeLedgerEntries([next, ...entries])
  return next
}

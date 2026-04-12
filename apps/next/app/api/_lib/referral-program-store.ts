import fs from 'node:fs/promises'
import path from 'node:path'
import { ReferralProgramSettings } from '@real/app/lib/referral/referral-types'
import { DEFAULT_STORE_ID, normalizeReferralProgramSettings } from '@real/app/lib/referral/referral-schema'

const STORAGE_DIR = path.join(process.cwd(), '.data')
const STORAGE_FILE = path.join(STORAGE_DIR, 'referral-program-store.json')

function buildInitialProgram(): ReferralProgramSettings {
  return normalizeReferralProgramSettings({
    storeId: DEFAULT_STORE_ID,
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
  })
}

export async function readReferralProgramSettings(storeId = DEFAULT_STORE_ID): Promise<ReferralProgramSettings> {
  try {
    const raw = await fs.readFile(STORAGE_FILE, 'utf8')
    const parsed = JSON.parse(raw) as Partial<ReferralProgramSettings> | Record<string, Partial<ReferralProgramSettings>>
    if ('mode' in parsed || 'policy' in parsed) {
      return normalizeReferralProgramSettings(parsed as Partial<ReferralProgramSettings>)
    }
    const byStore = (parsed as Record<string, Partial<ReferralProgramSettings>>)[storeId]
    return normalizeReferralProgramSettings(byStore ?? buildInitialProgram())
  } catch {
    return buildInitialProgram()
  }
}

export async function writeReferralProgramSettings(settings: ReferralProgramSettings) {
  await fs.mkdir(STORAGE_DIR, { recursive: true })
  await fs.writeFile(
    STORAGE_FILE,
    JSON.stringify(
      {
        [settings.storeId]: normalizeReferralProgramSettings(settings),
      },
      null,
      2
    ),
    'utf8'
  )
}

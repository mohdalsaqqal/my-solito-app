import {
  buildReferralApplyResponse,
  DEFAULT_STORE_ID,
  normalizeReferralApplyRequest,
  validateReferralRequest,
} from '@real/app/lib/referral/referral-schema'
import { fail, ok } from '../../_lib/response'
import { requireAuthSession } from '../../_lib/request-auth'
import { createReferralLedgerEntry } from '../../_lib/referral-ledger-store'
import { getReferralProfileByCode } from '../../_lib/referral-profile-store'
import { readReferralProgramSettings } from '../../_lib/referral-program-store'

export async function POST(request: Request) {
  try {
    const session = await requireAuthSession(request)
    if (session instanceof Response) {
      return session
    }

    const body = await request.json().catch(() => ({}))
    const normalized = normalizeReferralApplyRequest(body)
    const storeId = DEFAULT_STORE_ID
    const program = await readReferralProgramSettings(storeId)
    const profile = normalized.code ? await getReferralProfileByCode(normalized.code, storeId) : null
    const validation = validateReferralRequest({
      request: {
        code: normalized.code,
        cartSubtotal: normalized.cartSubtotal,
        currency: normalized.currency,
      },
      program,
      profile,
    })

    if (!validation.eligible || !validation.profileId || !validation.code) {
      return fail(validation.reasonCode ?? 'REFERRAL_INVALID', 'Referral code could not be applied.', 400)
    }

    const ledgerEntry = await createReferralLedgerEntry({
      storeId,
      profileId: validation.profileId,
      referredUserId: session.userId,
      orderId: normalized.orderId,
      code: validation.code,
      status: 'pending',
      currency: normalized.currency ?? 'USD',
      subtotal: normalized.cartSubtotal,
      followerRewardValue: validation.rewardPreview?.value,
      influencerRewardValue: undefined,
    })

    return ok(
      buildReferralApplyResponse({
        validation,
        ledgerEntryId: ledgerEntry.id,
      })
    )
  } catch (cause) {
    return fail('REFERRAL_APPLY_UNEXPECTED', 'Unexpected error while applying referral code.', 500, {
      scope: 'POST /api/referral/apply',
      cause,
    })
  }
}

import { matchProviderResult } from '@real/providers/contracts'
import { fail, ok } from '../../../_lib/response'
import { requireAuthSession } from '../../../_lib/request-auth'
import { PharmacistScanResolveBodySchema } from '../../../_lib/validation-schemas'
import { resolvePharmacistCustomerByQr } from '../../../../../server/services/pharmacist/pharmacist-consultation.service'

export async function POST(request: Request) {
  try {
    const session = await requireAuthSession(request)
    if (session instanceof Response) {
      return session
    }
    const body = ((await request.json().catch(() => ({}))) ?? {}) as Record<string, unknown>
    const parsed = PharmacistScanResolveBodySchema.safeParse(body)
    if (!parsed.success) {
      return fail('PHARMACIST_QR_INVALID', parsed.error.issues[0]?.message ?? 'QR code is required.', 400)
    }

    const result = await resolvePharmacistCustomerByQr(session, parsed.data.qrCode)
    return matchProviderResult(result, {
      ok: (data) => ok(data),
      fail: (error) =>
        fail(
          error.code,
          error.message,
          error.code === 'AUTH_FORBIDDEN' ? 403 : error.code === 'PHARMACIST_QR_NOT_FOUND' ? 404 : 400,
        ),
    })
  } catch (cause) {
    return fail('PHARMACIST_RESOLVE_QR_UNEXPECTED', 'Unexpected error while resolving QR.', 500, {
      scope: 'POST /api/pharmacist/scan/resolve',
      cause,
    })
  }
}

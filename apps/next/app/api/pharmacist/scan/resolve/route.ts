import { pharmacistProvider } from '@real/providers'
import { matchProviderResult } from '@real/providers/contracts'
import { fail, ok } from '../../../_lib/response'
import { requireAuthSession } from '../../../_lib/request-auth'

type ResolveQrPayload = {
  qrCode?: string
}

export async function POST(request: Request) {
  try {
    const session = await requireAuthSession(request)
    if (session instanceof Response) {
      return session
    }
    if (session.role !== 'pharmacist' && session.role !== 'admin') {
      return fail('AUTH_FORBIDDEN', 'Pharmacist access is required.', 403)
    }

    const payload = ((await request.json().catch(() => ({}))) ?? {}) as ResolveQrPayload
    const qrCode = payload.qrCode?.trim() ?? ''
    if (!qrCode) {
      return fail('PHARMACIST_QR_INVALID', 'QR code is required.', 400)
    }

    const result = await pharmacistProvider.resolveCustomerByQr(qrCode)
    return matchProviderResult(result, {
      ok: (data) => ok(data),
      fail: (error) => fail(error.code, error.message, error.code === 'PHARMACIST_QR_NOT_FOUND' ? 404 : 400),
    })
  } catch (cause) {
    return fail('PHARMACIST_RESOLVE_QR_UNEXPECTED', 'Unexpected error while resolving QR.', 500, {
      scope: 'POST /api/pharmacist/scan/resolve',
      cause,
    })
  }
}


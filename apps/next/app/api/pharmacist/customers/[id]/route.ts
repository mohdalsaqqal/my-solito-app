import { matchProviderResult } from '@real/providers/contracts'
import { fail, ok } from '../../../_lib/response'
import { requireAuthSession } from '../../../_lib/request-auth'
import { getPharmacistCustomerProfile } from '../../../../../server/services/pharmacist/pharmacist-consultation.service'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuthSession(request)
    if (session instanceof Response) {
      return session
    }
    const { id } = await params
    const result = await getPharmacistCustomerProfile(session, id)
    return matchProviderResult(result, {
      ok: (data) => ok(data),
      fail: (error) =>
        fail(
          error.code,
          error.message,
          error.code === 'AUTH_FORBIDDEN' ? 403 : error.code === 'PHARMACIST_CUSTOMER_NOT_FOUND' ? 404 : 400,
        ),
    })
  } catch (cause) {
    return fail('PHARMACIST_CUSTOMER_UNEXPECTED', 'Unexpected error while fetching customer profile.', 500, {
      scope: 'GET /api/pharmacist/customers/[id]',
      cause,
    })
  }
}

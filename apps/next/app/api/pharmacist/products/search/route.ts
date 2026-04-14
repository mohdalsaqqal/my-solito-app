import { ensureRequestConnection } from '../../../_lib/route-connection'
import { pharmacistProvider } from '@real/providers'
import { matchProviderResult } from '@real/providers/contracts'
import { fail, ok } from '../../../_lib/response'
import { requireAuthSession } from '../../../_lib/request-auth'

export async function GET(request: Request) {
  try {
    await ensureRequestConnection()
    const session = await requireAuthSession(request)
    if (session instanceof Response) {
      return session
    }
    if (session.role !== 'pharmacist' && session.role !== 'admin') {
      return fail('AUTH_FORBIDDEN', 'Pharmacist access is required.', 403)
    }

    const url = new URL(request.url)
    const query = url.searchParams.get('q') ?? ''
    const result = await pharmacistProvider.searchProducts(query)
    return matchProviderResult(result, {
      ok: (data) => ok(data),
      fail: (error) => fail(error.code, error.message, 400),
    })
  } catch (cause) {
    return fail('PHARMACIST_PRODUCT_SEARCH_UNEXPECTED', 'Unexpected error while searching products.', 500, {
      scope: 'GET /api/pharmacist/products/search',
      cause,
    })
  }
}

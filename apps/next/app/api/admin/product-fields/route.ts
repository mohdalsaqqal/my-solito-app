import { adminProductProvider } from '@real/providers'
import { fail, ok } from '../../_lib/response'
import { requireAdminDomainSession } from '../../_lib/request-auth'

export async function GET(request: Request) {
  try {
    const session = requireAdminDomainSession(request, 'catalog')
    if (session instanceof Response) return session

    const result = await adminProductProvider.productFields()
    if (!result.ok) return fail(result.error.code, result.error.message, 400)
    return ok(result.data)
  } catch (cause) {
    return fail('ADMIN_PRODUCT_FIELDS_UNEXPECTED', 'Unexpected error while loading product fields.', 500, {
      scope: 'GET /api/admin/product-fields',
      cause,
    })
  }
}

import { adminVendorProvider } from '@real/providers'
import { fail, ok } from '../../_lib/response'
import { requireAdminDomainSession } from '../../_lib/request-auth'

export async function GET(request: Request) {
  try {
    const session = requireAdminDomainSession(request, 'marketplace')
    if (session instanceof Response) return session

    const result = await adminVendorProvider.vendorFields()
    if (!result.ok) return fail(result.error.code, result.error.message, 400)
    return ok(result.data)
  } catch (cause) {
    return fail('ADMIN_VENDOR_FIELDS_UNEXPECTED', 'Unexpected error while loading vendor fields.', 500, {
      scope: 'GET /api/admin/vendor-fields',
      cause,
    })
  }
}

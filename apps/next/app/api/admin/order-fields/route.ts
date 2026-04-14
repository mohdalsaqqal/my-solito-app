import { adminOrderProvider } from '@real/providers'
import { fail, ok } from '../../_lib/response'
import { requireAdminDomainSession } from '../../_lib/request-auth'

export async function GET(request: Request) {
  try {
    const session = await requireAdminDomainSession(request, 'sales')
    if (session instanceof Response) return session

    const result = await adminOrderProvider.orderFields()
    if (!result.ok) return fail(result.error.code, result.error.message, 400)
    return ok(result.data)
  } catch (cause) {
    return fail('ADMIN_ORDER_FIELDS_UNEXPECTED', 'Unexpected error while loading order fields.', 500, {
      scope: 'GET /api/admin/order-fields',
      cause,
    })
  }
}

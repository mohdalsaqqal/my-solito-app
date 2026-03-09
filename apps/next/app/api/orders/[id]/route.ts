import { matchProviderResult } from '@real/providers/contracts'
import { orderProvider } from '@real/providers'
import { fail, ok } from '../../_lib/response'
import { requireAuthSession } from '../../_lib/request-auth'
import { hasAdminDomainPermission } from '../../_lib/admin-rbac'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = requireAuthSession(request)
    if (session instanceof Response) {
      return session
    }

    const { id } = await params

    const result = await orderProvider.get(id)

    if (
      result.ok &&
      !hasAdminDomainPermission(session.role, 'orders', 'read') &&
      ((result.data.ownerUserId && result.data.ownerUserId !== session.userId) ||
        (!result.data.ownerUserId && !id.startsWith(`ord-${session.userId}-`)))
    ) {
      return fail('ORDER_NOT_FOUND', 'Order not found.', 404)
    }

    return matchProviderResult(result, {
      ok: (data) => ok(data),
      fail: (error) => fail(error.code, error.message, 404),
    })
  } catch (cause) {
    return fail('ORDER_GET_UNEXPECTED', 'Unexpected error while fetching order.', 500, {
      scope: 'GET /api/orders/[id]',
      cause,
    })
  }
}

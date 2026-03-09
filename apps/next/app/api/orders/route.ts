import { matchProviderResult } from '@real/providers/contracts'
import { orderProvider } from '@real/providers'
import { fail, ok } from '../_lib/response'
import { requireAuthSession } from '../_lib/request-auth'
import { hasAdminDomainPermission } from '../_lib/admin-rbac'

export async function GET(request: Request) {
  try {
    const session = requireAuthSession(request)
    if (session instanceof Response) {
      return session
    }

    const result = await orderProvider.list()
    return matchProviderResult(result, {
      ok: (data) => {
        if (hasAdminDomainPermission(session.role, 'orders', 'read')) {
          return ok(data)
        }
        const ownOrders = data.filter((order) => {
          if (order.ownerUserId) {
            return order.ownerUserId === session.userId
          }
          return order.id.startsWith(`ord-${session.userId}-`)
        })
        return ok(ownOrders)
      },
      fail: (error) => fail(error.code, error.message, 500),
    })
  } catch (cause) {
    return fail('ORDER_LIST_UNEXPECTED', 'Unexpected error while fetching orders.', 500, {
      scope: 'GET /api/orders',
      cause,
    })
  }
}

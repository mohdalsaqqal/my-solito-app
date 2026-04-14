import { OrderUpdateInput } from '@real/providers/contracts'
import { fail, ok } from '../../../_lib/response'
import { requireAdminDomainSession } from '../../../_lib/request-auth'
import { ServiceError } from '../../../../../server/services/_lib/service-error'
import {
  getAdminOrderDetail,
  updateAdminOrder,
} from '../../../../../server/services/admin/admin-orders.service'

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdminDomainSession(request, 'sales')
    if (session instanceof Response) return session

    const { id } = await context.params
    return ok(await getAdminOrderDetail(id))
  } catch (cause) {
    if (cause instanceof ServiceError) {
      return fail(cause.code, cause.message, cause.status, {
        scope: 'GET /api/admin/orders/[id]',
        cause: cause.cause ?? cause,
      })
    }
    return fail('ADMIN_ORDER_DETAIL_UNEXPECTED', 'Unexpected error while loading order detail.', 500, {
      scope: 'GET /api/admin/orders/[id]',
      cause,
    })
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdminDomainSession(request, 'sales', 'full')
    if (session instanceof Response) return session

    const body = ((await request.json().catch(() => ({}))) ?? {}) as Partial<OrderUpdateInput>
    const { id } = await context.params
    return ok(await updateAdminOrder(id, body))
  } catch (cause) {
    if (cause instanceof ServiceError) {
      return fail(cause.code, cause.message, cause.status, {
        scope: 'PATCH /api/admin/orders/[id]',
        cause: cause.cause ?? cause,
      })
    }
    return fail('ADMIN_ORDER_UPDATE_UNEXPECTED', 'Unexpected error while updating order.', 500, {
      scope: 'PATCH /api/admin/orders/[id]',
      cause,
    })
  }
}

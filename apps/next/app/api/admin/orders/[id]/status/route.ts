import { OrderStatus } from '@real/providers/contracts'
import { fail, ok } from '../../../../_lib/response'
import { requireAdminDomainSession } from '../../../../_lib/request-auth'
import { ServiceError } from '../../../../../../server/services/_lib/service-error'
import { updateAdminOrderStatus } from '../../../../../../server/services/admin/admin-orders.service'

type UpdateStatusPayload = {
  status?: OrderStatus
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminDomainSession(request, 'sales', 'full')
    if (session instanceof Response) {
      return session
    }

    const { id } = await params
    const payload = ((await request.json().catch(() => ({}))) ?? {}) as UpdateStatusPayload
    return ok(await updateAdminOrderStatus(id, payload.status))
  } catch (cause) {
    if (cause instanceof ServiceError) {
      return fail(cause.code, cause.message, cause.status, {
        scope: 'POST /api/admin/orders/[id]/status',
        cause: cause.cause ?? cause,
      })
    }
    return fail('ADMIN_ORDER_STATUS_UNEXPECTED', 'Unexpected error while updating order status.', 500, {
      scope: 'POST /api/admin/orders/[id]/status',
      cause,
    })
  }
}

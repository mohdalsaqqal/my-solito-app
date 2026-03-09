import { orderProvider } from '@real/providers'
import { OrderStatus, matchProviderResult } from '@real/providers/contracts'
import { fail, ok } from '../../../../_lib/response'
import { requireAdminDomainSession } from '../../../../_lib/request-auth'

type UpdateStatusPayload = {
  status?: OrderStatus
}

const allowedStatuses: OrderStatus[] = ['placed', 'shipped', 'delivered', 'cancelled']

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = requireAdminDomainSession(request, 'orders', 'full')
    if (session instanceof Response) {
      return session
    }

    const { id } = await params
    const payload = ((await request.json().catch(() => ({}))) ?? {}) as UpdateStatusPayload
    if (!payload.status || !allowedStatuses.includes(payload.status)) {
      return fail('ORDER_STATUS_INVALID', 'A valid order status is required.', 400)
    }

    const result = await orderProvider.updateStatus(id, payload.status)
    return matchProviderResult(result, {
      ok: (data) => ok(data),
      fail: (error) =>
        fail(
          error.code,
          error.message,
          error.code === 'ORDER_NOT_FOUND'
            ? 404
            : error.code === 'ORDER_STATUS_INVALID_TRANSITION'
              ? 409
              : 400
        ),
    })
  } catch (cause) {
    return fail('ADMIN_ORDER_STATUS_UNEXPECTED', 'Unexpected error while updating order status.', 500, {
      scope: 'POST /api/admin/orders/[id]/status',
      cause,
    })
  }
}

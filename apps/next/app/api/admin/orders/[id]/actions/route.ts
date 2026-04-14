import { OrderActionInput } from '@real/providers/contracts'
import { fail, ok } from '../../../../_lib/response'
import { requireAdminDomainSession } from '../../../../_lib/request-auth'
import { ServiceError } from '../../../../../../server/services/_lib/service-error'
import { runAdminOrderAction } from '../../../../../../server/services/admin/admin-orders.service'

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdminDomainSession(request, 'sales', 'full')
    if (session instanceof Response) return session

    const body = ((await request.json().catch(() => ({}))) ?? {}) as OrderActionInput
    const { id } = await context.params
    return ok(await runAdminOrderAction(id, body))
  } catch (cause) {
    if (cause instanceof ServiceError) {
      return fail(cause.code, cause.message, cause.status, {
        scope: 'POST /api/admin/orders/[id]/actions',
        cause: cause.cause ?? cause,
      })
    }
    return fail('ADMIN_ORDER_ACTION_UNEXPECTED', 'Unexpected error while running order action.', 500, {
      scope: 'POST /api/admin/orders/[id]/actions',
      cause,
    })
  }
}

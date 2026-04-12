import { adminInventoryProvider } from '@real/providers'
import { InventoryActionInput } from '@real/providers/contracts'
import { fail, ok } from '../../../../_lib/response'
import { requireAdminDomainSession } from '../../../../_lib/request-auth'

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = requireAdminDomainSession(request, 'inventory', 'full')
    if (session instanceof Response) return session

    const body = ((await request.json().catch(() => ({}))) ?? {}) as InventoryActionInput
    if (!body.action) return fail('ADMIN_INVENTORY_ACTION_REQUIRED', 'Inventory action is required.', 400)

    const { id } = await context.params
    const result = await adminInventoryProvider.runInventoryAction(id, body)
    if (!result.ok) return fail(result.error.code, result.error.message, 404)
    return ok(result.data)
  } catch (cause) {
    return fail('ADMIN_INVENTORY_ACTION_UNEXPECTED', 'Unexpected error while running inventory action.', 500, {
      scope: 'POST /api/admin/inventory/[id]/actions',
      cause,
    })
  }
}


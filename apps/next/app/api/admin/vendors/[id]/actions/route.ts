import { adminVendorProvider } from '@real/providers'
import { VendorActionInput } from '@real/providers/contracts'
import { fail, ok } from '../../../../_lib/response'
import { requireAdminDomainSession } from '../../../../_lib/request-auth'

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = requireAdminDomainSession(request, 'marketplace', 'full')
    if (session instanceof Response) return session

    const body = ((await request.json().catch(() => ({}))) ?? {}) as VendorActionInput
    if (!body.action) return fail('ADMIN_VENDOR_ACTION_REQUIRED', 'Vendor action is required.', 400)

    const { id } = await context.params
    const result = await adminVendorProvider.runVendorAction(id, body)
    if (!result.ok) return fail(result.error.code, result.error.message, 404)
    return ok(result.data)
  } catch (cause) {
    return fail('ADMIN_VENDOR_ACTION_UNEXPECTED', 'Unexpected error while running vendor action.', 500, {
      scope: 'POST /api/admin/vendors/[id]/actions',
      cause,
    })
  }
}


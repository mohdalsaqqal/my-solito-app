import { requireAdminDomainSession } from '../../../../../_lib/request-auth'
import { fail, ok } from '../../../../../_lib/response'

export async function POST(request: Request) {
  try {
    const session = requireAdminDomainSession(request, 'catalog', 'full')
    if (session instanceof Response) return session

    // Sync is a stub — real sync would call the source adapter when one is configured
    return ok({ synced: { created: 0, updated: 0, message: 'No source adapter configured' } })
  } catch (cause) {
    return fail(
      'ADMIN_CATEGORY_SYNC_UNEXPECTED',
      'Unexpected error while syncing categories.',
      500,
      { scope: 'POST /api/admin/catalog/categories/sync', cause }
    )
  }
}

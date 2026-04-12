import { adminJobProvider } from '@real/providers'
import { fail, ok } from '../../../_lib/response'
import { requireAdminAnyDomainSession } from '../../../_lib/request-auth'

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = requireAdminAnyDomainSession(request, ['catalog', 'sales', 'inventory', 'marketplace', 'operations'])
    if (session instanceof Response) return session

    const { id } = await context.params
    const result = await adminJobProvider.getJob(id)
    if (!result.ok) return fail(result.error.code, result.error.message, 404)
    return ok(result.data)
  } catch (cause) {
    return fail('ADMIN_JOB_DETAIL_UNEXPECTED', 'Unexpected error while loading admin job.', 500, {
      scope: 'GET /api/admin/jobs/[id]',
      cause,
    })
  }
}


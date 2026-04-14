import { adminJobProvider } from '@real/providers'
import { AdminJobCreateInput } from '@real/providers/contracts'
import { fail, ok } from '../../_lib/response'
import { requireAdminAnyDomainSession } from '../../_lib/request-auth'

export async function GET(request: Request) {
  try {
    const session = await requireAdminAnyDomainSession(request, ['catalog', 'sales', 'inventory', 'marketplace', 'operations'])
    if (session instanceof Response) return session

    const result = await adminJobProvider.listJobs()
    if (!result.ok) return fail(result.error.code, result.error.message, 400)
    return ok(result.data)
  } catch (cause) {
    return fail('ADMIN_JOBS_LIST_UNEXPECTED', 'Unexpected error while loading admin jobs.', 500, {
      scope: 'GET /api/admin/jobs',
      cause,
    })
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAdminAnyDomainSession(request, ['catalog', 'sales', 'inventory', 'marketplace', 'operations'], 'full')
    if (session instanceof Response) return session

    const body = ((await request.json().catch(() => ({}))) ?? {}) as AdminJobCreateInput
    if (!body.type || !body.entity || !body.summary?.trim()) {
      return fail('ADMIN_JOB_INVALID', 'Job payload is invalid.', 400)
    }

    const result = await adminJobProvider.createJob(body, {
      userId: session.userId,
      email: session.email,
    })
    if (!result.ok) return fail(result.error.code, result.error.message, 400)
    return ok(result.data, 201)
  } catch (cause) {
    return fail('ADMIN_JOB_CREATE_UNEXPECTED', 'Unexpected error while creating admin job.', 500, {
      scope: 'POST /api/admin/jobs',
      cause,
    })
  }
}


import { fail, ok } from '../../_lib/response'
import { requireAdminDomainSession } from '../../_lib/request-auth'
import type { AdminCacheAction } from '@real/app/lib/types'
import { ServiceError } from '../../../../server/services/_lib/service-error'
import { getAdminCacheAudit, runAdminCacheAction } from '../../../../server/services/admin/admin-cache.service'

export async function GET(request: Request) {
  try {
    const session = await requireAdminDomainSession(request, 'operations')
    if (session instanceof Response) {
      return session
    }

    return ok(await getAdminCacheAudit())
  } catch (cause) {
    if (cause instanceof ServiceError) {
      return fail(cause.code, cause.message, cause.status, {
        scope: 'GET /api/admin/cache',
        cause: cause.cause ?? cause,
      })
    }
    return fail('ADMIN_CACHE_AUDIT_UNEXPECTED', 'Unexpected error while loading cache audit.', 500, {
      scope: 'GET /api/admin/cache',
      cause,
    })
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAdminDomainSession(request, 'operations', 'full')
    if (session instanceof Response) {
      return session
    }

    const payload = ((await request.json().catch(() => ({}))) ?? {}) as {
      action?: AdminCacheAction
      confirmation?: string
    }

    return ok(await runAdminCacheAction(
      {
        userId: session.userId,
        email: session.email,
        role: session.role,
      },
      payload,
    ))
  } catch (cause) {
    if (cause instanceof ServiceError) {
      return fail(cause.code, cause.message, cause.status, {
        scope: 'POST /api/admin/cache',
        cause: cause.cause ?? cause,
      })
    }
    return fail('ADMIN_CACHE_FLUSH_UNEXPECTED', 'Unexpected error while executing cache flush.', 500, {
      scope: 'POST /api/admin/cache',
      cause,
    })
  }
}

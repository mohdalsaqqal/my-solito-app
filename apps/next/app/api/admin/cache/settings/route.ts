import { fail, ok } from '../../../_lib/response'
import { requireAdminDomainSession } from '../../../_lib/request-auth'
import { readCacheSettings, writeCacheSettings } from '../../../_lib/admin-cache-store'

export async function GET(request: Request) {
  try {
    const session = requireAdminDomainSession(request, 'operations')
    if (session instanceof Response) return session
    return ok(await readCacheSettings())
  } catch (cause) {
    return fail('ADMIN_CACHE_SETTINGS_READ_ERROR', 'Unable to read cache settings.', 500, {
      scope: 'GET /api/admin/cache/settings',
      cause,
    })
  }
}

export async function POST(request: Request) {
  try {
    const session = requireAdminDomainSession(request, 'operations', 'full')
    if (session instanceof Response) return session

    const payload = ((await request.json().catch(() => ({}))) ?? {}) as {
      enabled?: boolean
    }

    if (typeof payload.enabled !== 'boolean') {
      return fail('ADMIN_CACHE_SETTINGS_INVALID', 'enabled must be a boolean.', 400, {
        scope: 'POST /api/admin/cache/settings',
      })
    }

    const next = await writeCacheSettings({
      enabled: payload.enabled,
      updatedBy: session.email,
    })
    return ok(next)
  } catch (cause) {
    return fail('ADMIN_CACHE_SETTINGS_WRITE_ERROR', 'Unable to update cache settings.', 500, {
      scope: 'POST /api/admin/cache/settings',
      cause,
    })
  }
}

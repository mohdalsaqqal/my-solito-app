import { fail, ok } from '../../../_lib/response'
import { requireAdminAnyDomainSession } from '../../../_lib/request-auth'
import { ServiceError } from '../../../../../server/services/_lib/service-error'
import {
  createAdminMenu,
  listAdminMenus,
} from '../../../../../server/services/admin/admin-menus.service'

export async function GET(request: Request) {
  try {
    const session = await requireAdminAnyDomainSession(request, ['marketing'])
    if (session instanceof Response) return session

    return ok(await listAdminMenus())
  } catch (cause) {
    if (cause instanceof ServiceError) {
      return fail(cause.code, cause.message, cause.status, {
        scope: 'GET /api/admin/cms/menus',
        cause: cause.cause ?? cause,
      })
    }
    return fail('ADMIN_MENU_LIST_UNEXPECTED', 'Unexpected error while loading menus.', 500, {
      scope: 'GET /api/admin/cms/menus',
      cause,
    })
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAdminAnyDomainSession(request, ['marketing'], 'full')
    if (session instanceof Response) return session

    const body = ((await request.json().catch(() => ({}))) ?? {}) as Record<string, unknown>
    return ok(
      await createAdminMenu(body, { userId: session.userId, email: session.email }),
      201,
    )
  } catch (cause) {
    if (cause instanceof ServiceError) {
      return fail(cause.code, cause.message, cause.status, {
        scope: 'POST /api/admin/cms/menus',
        cause: cause.cause ?? cause,
      })
    }
    return fail('ADMIN_MENU_CREATE_UNEXPECTED', 'Unexpected error while creating menu.', 500, {
      scope: 'POST /api/admin/cms/menus',
      cause,
    })
  }
}

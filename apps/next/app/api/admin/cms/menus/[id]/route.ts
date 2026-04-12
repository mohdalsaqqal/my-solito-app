import { fail, ok } from '../../../../_lib/response'
import { requireAdminAnyDomainSession } from '../../../../_lib/request-auth'
import { ServiceError } from '../../../../../../server/services/_lib/service-error'
import {
  deleteAdminMenu,
  getAdminMenu,
  updateAdminMenu,
} from '../../../../../../server/services/admin/admin-menus.service'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const session = requireAdminAnyDomainSession(request, ['marketing'])
    if (session instanceof Response) return session

    const { id } = await context.params
    return ok(await getAdminMenu(id))
  } catch (cause) {
    if (cause instanceof ServiceError) {
      return fail(cause.code, cause.message, cause.status, {
        scope: 'GET /api/admin/cms/menus/[id]',
        cause: cause.cause ?? cause,
      })
    }
    return fail('ADMIN_MENU_GET_UNEXPECTED', 'Unexpected error while loading menu.', 500, {
      scope: 'GET /api/admin/cms/menus/[id]',
      cause,
    })
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const session = requireAdminAnyDomainSession(request, ['marketing'], 'full')
    if (session instanceof Response) return session

    const { id } = await context.params
    const body = ((await request.json().catch(() => ({}))) ?? {}) as Record<string, unknown>
    return ok(
      await updateAdminMenu(id, body, { userId: session.userId, email: session.email }),
    )
  } catch (cause) {
    if (cause instanceof ServiceError) {
      return fail(cause.code, cause.message, cause.status, {
        scope: 'PATCH /api/admin/cms/menus/[id]',
        cause: cause.cause ?? cause,
      })
    }
    return fail('ADMIN_MENU_UPDATE_UNEXPECTED', 'Unexpected error while updating menu.', 500, {
      scope: 'PATCH /api/admin/cms/menus/[id]',
      cause,
    })
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const session = requireAdminAnyDomainSession(request, ['marketing'], 'full')
    if (session instanceof Response) return session

    const { id } = await context.params
    return ok(await deleteAdminMenu(id, { userId: session.userId, email: session.email }))
  } catch (cause) {
    if (cause instanceof ServiceError) {
      return fail(cause.code, cause.message, cause.status, {
        scope: 'DELETE /api/admin/cms/menus/[id]',
        cause: cause.cause ?? cause,
      })
    }
    return fail('ADMIN_MENU_DELETE_UNEXPECTED', 'Unexpected error while deleting menu.', 500, {
      scope: 'DELETE /api/admin/cms/menus/[id]',
      cause,
    })
  }
}

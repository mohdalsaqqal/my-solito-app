import { fail, ok } from '../../_lib/response'
import { requireAdminAnyDomainSession } from '../../_lib/request-auth'
import { ServiceError } from '../../../../server/services/_lib/service-error'
import { getAdminNotificationControlCenter } from '../../../../server/services/notifications/notification-control.service'

const notificationDomains = ['marketing', 'operations'] as const

export async function GET(request: Request) {
  try {
    const session = await requireAdminAnyDomainSession(request, notificationDomains)
    if (session instanceof Response) return session

    return ok(await getAdminNotificationControlCenter())
  } catch (cause) {
    if (cause instanceof ServiceError) {
      return fail(cause.code, cause.message, cause.status, {
        scope: 'GET /api/admin/notifications',
        cause: cause.cause ?? cause,
      })
    }
    return fail('ADMIN_NOTIFICATIONS_UNEXPECTED', 'Unexpected error while loading notifications.', 500, {
      scope: 'GET /api/admin/notifications',
      cause,
    })
  }
}

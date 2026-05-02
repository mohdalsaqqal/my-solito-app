import { fail, ok } from '../../../../_lib/response'
import { requireAdminDomainSession } from '../../../../_lib/request-auth'
import { ServiceError } from '../../../../../../server/services/_lib/service-error'
import { updateAdminNotificationTemplate } from '../../../../../../server/services/notifications/notification-control.service'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdminDomainSession(request, 'marketing', 'full')
    if (session instanceof Response) return session

    const { id } = await params
    const body = ((await request.json().catch(() => ({}))) ?? {}) as Record<string, unknown>
    return ok(
      await updateAdminNotificationTemplate(id, body, {
        userId: session.userId,
        email: session.email,
      }),
    )
  } catch (cause) {
    if (cause instanceof ServiceError) {
      return fail(cause.code, cause.message, cause.status, {
        scope: 'PATCH /api/admin/notifications/templates/[id]',
        cause: cause.cause ?? cause,
      })
    }
    return fail('ADMIN_NOTIFICATION_TEMPLATE_UNEXPECTED', 'Unexpected error while saving template.', 500, {
      scope: 'PATCH /api/admin/notifications/templates/[id]',
      cause,
    })
  }
}

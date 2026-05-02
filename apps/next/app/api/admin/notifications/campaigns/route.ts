import { fail, ok } from '../../../_lib/response'
import { requireAdminDomainSession } from '../../../_lib/request-auth'
import { ServiceError } from '../../../../../server/services/_lib/service-error'
import {
  createAdminNotificationCampaign,
  getAdminNotificationControlCenter,
} from '../../../../../server/services/notifications/notification-control.service'

export async function GET(request: Request) {
  try {
    const session = await requireAdminDomainSession(request, 'marketing')
    if (session instanceof Response) return session

    const center = await getAdminNotificationControlCenter()
    return ok(center.campaigns)
  } catch (cause) {
    return fail('ADMIN_NOTIFICATION_CAMPAIGNS_UNEXPECTED', 'Unexpected error while loading campaigns.', 500, {
      scope: 'GET /api/admin/notifications/campaigns',
      cause,
    })
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAdminDomainSession(request, 'marketing', 'full')
    if (session instanceof Response) return session

    const body = ((await request.json().catch(() => ({}))) ?? {}) as Record<string, unknown>
    return ok(
      await createAdminNotificationCampaign(body, {
        userId: session.userId,
        email: session.email,
      }),
      201,
    )
  } catch (cause) {
    if (cause instanceof ServiceError) {
      return fail(cause.code, cause.message, cause.status, {
        scope: 'POST /api/admin/notifications/campaigns',
        cause: cause.cause ?? cause,
      })
    }
    return fail('ADMIN_NOTIFICATION_CAMPAIGN_UNEXPECTED', 'Unexpected error while creating campaign.', 500, {
      scope: 'POST /api/admin/notifications/campaigns',
      cause,
    })
  }
}

import { fail, ok } from '../../_lib/response'
import { requireAuthSession } from '../../_lib/request-auth'
import { ServiceError } from '../../../../server/services/_lib/service-error'
import {
  registerPushDevice,
  unregisterPushDevice,
} from '../../../../server/services/notifications/notification.service'

type PushDevicePayload = {
  token?: string
  platform?: 'ios' | 'android' | 'web' | 'unknown'
  deviceId?: string
  locale?: string
}

export async function POST(request: Request) {
  try {
    const session = await requireAuthSession(request)
    if (session instanceof Response) {
      return session
    }

    const payload = ((await request.json().catch(() => ({}))) ?? {}) as PushDevicePayload
    return ok(
      await registerPushDevice({
        userId: session.userId,
        token: payload.token,
        platform: payload.platform,
        deviceId: payload.deviceId,
        locale: payload.locale,
      }),
      201
    )
  } catch (cause) {
    if (cause instanceof ServiceError) {
      return fail(cause.code, cause.message, cause.status, {
        scope: 'POST /api/notifications/devices',
        cause: cause.cause ?? cause,
      })
    }
    return fail('NOTIFICATION_DEVICE_UNEXPECTED', 'Unexpected error registering device.', 500, {
      scope: 'POST /api/notifications/devices',
      cause,
    })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await requireAuthSession(request)
    if (session instanceof Response) {
      return session
    }

    const payload = ((await request.json().catch(() => ({}))) ?? {}) as PushDevicePayload
    return ok(
      await unregisterPushDevice({
        userId: session.userId,
        token: payload.token,
      })
    )
  } catch (cause) {
    if (cause instanceof ServiceError) {
      return fail(cause.code, cause.message, cause.status, {
        scope: 'DELETE /api/notifications/devices',
        cause: cause.cause ?? cause,
      })
    }
    return fail('NOTIFICATION_DEVICE_UNEXPECTED', 'Unexpected error unregistering device.', 500, {
      scope: 'DELETE /api/notifications/devices',
      cause,
    })
  }
}

import { notificationProvider } from '@real/providers'
import type { NotificationDelivery, PushPlatform } from '@real/providers/contracts'
import { ServiceError } from '../_lib/service-error'
import {
  listNotificationDeadLetters,
  recordNotificationDeadLetter,
} from './notification-dead-letter.service'

export type RegisterPushDeviceInput = {
  tenantId?: string
  userId: string
  token?: string
  platform?: PushPlatform
  deviceId?: string
  locale?: string
}

export async function registerPushDevice(input: RegisterPushDeviceInput) {
  if (!input.token || typeof input.token !== 'string') {
    throw new ServiceError(
      'NOTIFICATION_TOKEN_REQUIRED',
      'A push notification token is required.',
      400
    )
  }

  const result = await notificationProvider.registerDevice({
    tenantId: input.tenantId,
    userId: input.userId,
    token: input.token,
    platform: input.platform ?? 'unknown',
    deviceId: input.deviceId,
    locale: input.locale,
  })

  if (!result.ok) {
    throw new ServiceError(result.error.code, result.error.message, 400)
  }

  return result.data
}

export async function unregisterPushDevice(input: {
  tenantId?: string
  userId: string
  token?: string
}) {
  if (!input.token || typeof input.token !== 'string') {
    throw new ServiceError(
      'NOTIFICATION_TOKEN_REQUIRED',
      'A push notification token is required.',
      400
    )
  }

  const result = await notificationProvider.unregisterDevice({
    tenantId: input.tenantId,
    userId: input.userId,
    token: input.token,
  })

  if (!result.ok) {
    throw new ServiceError(result.error.code, result.error.message, 400)
  }

  return result.data
}

export async function sendOrderStatusNotification(input: {
  tenantId?: string
  userId?: string
  recipientEmail?: string
  orderId: string
  status: string
}) {
  const result = await notificationProvider.sendOrderStatusUpdate(input)

  if (!result.ok) {
    await recordNotificationDeadLetter({
      tenantId: input.tenantId,
      userId: input.userId,
      orderId: input.orderId,
      channel: 'push',
      delivery: {
        id: `notif-provider-error-${Date.now()}`,
        provider: 'multi-channel',
        status: 'failed',
        error: result.error.message,
      },
    })
    throw new ServiceError(result.error.code, result.error.message, 400)
  }

  await recordFailedDelivery(input, result.data)
  return result.data
}

export async function sendUserEmailNotification(input: {
  tenantId?: string
  userId?: string
  recipientEmail?: string
  title: string
  body: string
  data?: Record<string, string>
}) {
  const result = await notificationProvider.sendToUser({
    tenantId: input.tenantId,
    userId: input.userId,
    recipientEmail: input.recipientEmail,
    channel: 'email',
    title: input.title,
    body: input.body,
    data: input.data,
  })

  if (!result.ok) {
    throw new ServiceError(result.error.code, result.error.message, 400)
  }

  await recordFailedDelivery(
    {
      tenantId: input.tenantId,
      userId: input.userId,
      orderId: input.data?.orderId,
      status: input.data?.status ?? 'email',
    },
    result.data,
  )
  return result.data
}

async function recordFailedDelivery(
  input: {
    tenantId?: string
    userId?: string
    orderId?: string
    status: string
  },
  delivery: NotificationDelivery,
) {
  if (delivery.status !== 'failed') return null
  return recordNotificationDeadLetter({
    tenantId: input.tenantId,
    userId: input.userId,
    orderId: input.orderId,
    channel: 'notification',
    delivery,
  })
}

export async function getNotificationStatus() {
  const [healthResult, deadLetters] = await Promise.all([
    notificationProvider.health?.(),
    listNotificationDeadLetters(),
  ])

  return {
    provider: healthResult?.ok ? healthResult.data.provider : 'unknown',
    ready: healthResult?.ok ? healthResult.data.ready : false,
    deadLetterCount: deadLetters.length,
    pendingRetryCount: deadLetters.filter((record) => record.retryCount === 0).length,
  }
}

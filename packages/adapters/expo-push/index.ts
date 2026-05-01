import {
  NotificationDelivery,
  NotificationMessage,
  NotificationProvider,
  NotificationRegistration,
  NotificationRegistrationInput,
} from '@real/providers/contracts'

type ExpoPushAdapterOptions = {
  accessToken?: string
}

const registrations = new Map<string, NotificationRegistration>()

function registrationKey(input: { userId: string; token: string }) {
  return `${input.userId}:${input.token}`
}

function toExpoMessage(message: NotificationMessage, token: string) {
  return {
    to: token,
    sound: 'default',
    title: message.title,
    body: message.body,
    data: message.data ?? {},
  }
}

export function createExpoPushNotificationAdapter(
  options: ExpoPushAdapterOptions = {}
): NotificationProvider {
  async function send(messages: Array<ReturnType<typeof toExpoMessage>>): Promise<NotificationDelivery> {
    if (messages.length === 0) {
      return {
        id: `expo-push-${Date.now()}`,
        provider: 'expo-push',
        status: 'skipped',
        tokenCount: 0,
        error: 'No registered push tokens for user.',
      }
    }

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(options.accessToken ? { Authorization: `Bearer ${options.accessToken}` } : {}),
      },
      body: JSON.stringify(messages.length === 1 ? messages[0] : messages),
    })

    if (!response.ok) {
      return {
        id: `expo-push-${Date.now()}`,
        provider: 'expo-push',
        status: 'failed',
        tokenCount: messages.length,
        error: `Expo push API returned ${response.status}.`,
      }
    }

    return {
      id: `expo-push-${Date.now()}`,
      provider: 'expo-push',
      status: 'sent',
      tokenCount: messages.length,
    }
  }

  return {
    async registerDevice(input: NotificationRegistrationInput) {
      const now = new Date().toISOString()
      const key = registrationKey(input)
      const existing = registrations.get(key)
      const registration: NotificationRegistration = {
        ...input,
        id: existing?.id ?? `expo-push-reg-${Date.now()}`,
        registeredAt: existing?.registeredAt ?? now,
        updatedAt: now,
      }
      registrations.set(key, registration)

      return { ok: true, data: registration }
    },

    async unregisterDevice(input) {
      const removed = registrations.delete(registrationKey(input))
      return { ok: true, data: { removed } }
    },

    async sendToUser(message) {
      if (!message.userId) {
        return {
          ok: false,
          error: {
            code: 'NOTIFICATION_USER_REQUIRED',
            message: 'User notification requires a user id.',
          },
        }
      }

      const messages = Array.from(registrations.values())
        .filter(
          (item) =>
            item.userId === message.userId &&
            (!message.tenantId || !item.tenantId || item.tenantId === message.tenantId)
        )
        .map((item) => toExpoMessage(message, item.token))

      return { ok: true, data: await send(messages) }
    },

    async sendOrderStatusUpdate(input) {
      if (!input.userId) {
        return {
          ok: true,
          data: {
            id: `expo-push-${Date.now()}`,
            provider: 'expo-push',
            status: 'skipped',
            tokenCount: 0,
            error: 'Order does not have an owner user id.',
          },
        }
      }

      return this.sendToUser({
        tenantId: input.tenantId,
        userId: input.userId,
        orderId: input.orderId,
        channel: 'push',
        title: 'Order update',
        body: `Your order ${input.orderId} is now ${input.status}.`,
        data: {
          type: 'order_status',
          orderId: input.orderId,
          status: input.status,
        },
      })
    },

    async health() {
      return { ok: true, data: { provider: 'expo-push', ready: true } }
    },
  }
}

export function createExpoPushNotificationAdapterFromEnv() {
  if (process.env.USE_EXPO_PUSH !== 'true') {
    return null
  }

  return createExpoPushNotificationAdapter({
    accessToken: process.env.EXPO_PUSH_ACCESS_TOKEN,
  })
}

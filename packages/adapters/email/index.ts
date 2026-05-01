import type {
  NotificationDelivery,
  NotificationMessage,
  NotificationProvider,
  NotificationRegistrationInput,
} from '@real/providers/contracts'

type EmailNotificationAdapterOptions = {
  endpoint: string
  apiKey?: string
  from: string
}

function delivery(status: NotificationDelivery['status'], error?: string): NotificationDelivery {
  return {
    id: `email-${Date.now()}`,
    provider: 'email',
    status,
    tokenCount: status === 'sent' ? 1 : 0,
    error,
  }
}

function recipient(message: NotificationMessage) {
  return message.recipientEmail ?? message.data?.email
}

export function createEmailNotificationAdapter(options: EmailNotificationAdapterOptions): NotificationProvider {
  async function sendEmail(message: NotificationMessage) {
    const to = recipient(message)
    if (!to) {
      return delivery('skipped', 'Email notification requires recipientEmail or data.email.')
    }

    const response = await fetch(options.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(options.apiKey ? { Authorization: `Bearer ${options.apiKey}` } : {}),
      },
      body: JSON.stringify({
        from: options.from,
        to,
        subject: message.title,
        text: message.body,
        data: message.data ?? {},
      }),
    })

    if (!response.ok) {
      return delivery('failed', `Email provider returned ${response.status}.`)
    }

    return delivery('sent')
  }

  return {
    async registerDevice(input: NotificationRegistrationInput) {
      return {
        ok: true,
        data: {
          ...input,
          id: `email-noop-${Date.now()}`,
          registeredAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      }
    },

    async unregisterDevice() {
      return { ok: true, data: { removed: false } }
    },

    async sendToUser(message) {
      if (message.channel !== 'email') {
        return { ok: true, data: delivery('skipped', 'Email adapter only handles email channel.') }
      }

      try {
        return { ok: true, data: await sendEmail(message) }
      } catch (cause) {
        return {
          ok: true,
          data: delivery('failed', cause instanceof Error ? cause.message : 'Email provider unavailable.'),
        }
      }
    },

    async sendOrderStatusUpdate(input) {
      return this.sendToUser({
        tenantId: input.tenantId,
        userId: input.userId,
        recipientEmail: input.recipientEmail,
        orderId: input.orderId,
        channel: 'email',
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
      return { ok: true, data: { provider: 'email', ready: Boolean(options.endpoint && options.from) } }
    },
  }
}

export function createEmailNotificationAdapterFromEnv() {
  if (process.env.USE_EMAIL_NOTIFICATIONS !== 'true') {
    return null
  }

  const endpoint = process.env.EMAIL_NOTIFICATION_ENDPOINT
  const from = process.env.EMAIL_NOTIFICATION_FROM
  if (!endpoint || !from) {
    return null
  }

  return createEmailNotificationAdapter({
    endpoint,
    apiKey: process.env.EMAIL_NOTIFICATION_API_KEY,
    from,
  })
}

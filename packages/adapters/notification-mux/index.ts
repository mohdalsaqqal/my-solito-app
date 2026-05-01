import type {
  NotificationDelivery,
  NotificationProvider,
} from '@real/providers/contracts'

function combineDeliveries(deliveries: NotificationDelivery[]): NotificationDelivery {
  const failed = deliveries.filter((item) => item.status === 'failed')
  const sent = deliveries.filter((item) => item.status === 'sent')
  const skipped = deliveries.filter((item) => item.status === 'skipped')

  return {
    id: `multi-notif-${Date.now()}`,
    provider: 'multi-channel',
    status: failed.length > 0 ? 'failed' : sent.length > 0 ? 'sent' : skipped.length > 0 ? 'skipped' : 'queued',
    tokenCount: deliveries.reduce((total, item) => total + (item.tokenCount ?? 0), 0),
    error: failed.map((item) => item.error).filter(Boolean).join('; ') || undefined,
  }
}

export function createMultiChannelNotificationProvider(input: {
  push: NotificationProvider
  email?: NotificationProvider | null
}): NotificationProvider {
  return {
    registerDevice(inputValue) {
      return input.push.registerDevice(inputValue)
    },

    unregisterDevice(inputValue) {
      return input.push.unregisterDevice(inputValue)
    },

    async sendToUser(message) {
      if (message.channel === 'email') {
        if (!input.email) {
          return {
            ok: true,
            data: {
              id: `email-skipped-${Date.now()}`,
              provider: 'email',
              status: 'skipped',
              tokenCount: 0,
              error: 'Email notification adapter is not configured.',
            },
          }
        }
        return input.email.sendToUser(message)
      }

      return input.push.sendToUser(message)
    },

    async sendOrderStatusUpdate(orderInput) {
      const deliveries: NotificationDelivery[] = []
      const pushResult = await input.push.sendOrderStatusUpdate(orderInput)
      if (pushResult.ok) deliveries.push(pushResult.data)

      if (input.email) {
        const emailResult = await input.email.sendOrderStatusUpdate(orderInput)
        if (emailResult.ok) deliveries.push(emailResult.data)
      }

      if (deliveries.length === 0 && !pushResult.ok) {
        return pushResult
      }

      return { ok: true, data: combineDeliveries(deliveries) }
    },

    async health() {
      const pushHealth = await input.push.health?.()
      const emailHealth = input.email ? await input.email.health?.() : null

      return {
        ok: true,
        data: {
          provider: 'multi-channel',
          ready: Boolean(pushHealth?.ok && pushHealth.data.ready && (!input.email || emailHealth?.ok)),
        },
      }
    },
  }
}

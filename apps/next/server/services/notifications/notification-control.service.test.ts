import { test } from 'node:test'
import assert from 'node:assert/strict'
import { notificationProvider } from '@real/providers'
import {
  clearAdminNotificationControlStateForTest,
  createAdminNotificationCampaign,
  getAdminNotificationControlCenter,
  updateAdminNotificationTemplate,
} from './notification-control.service'
import { clearNotificationDeadLetters } from './notification-dead-letter.service'

const actor = { userId: 'admin-1', email: 'admin@example.com' }

test('notification control center exposes templates and status', async () => {
  await clearAdminNotificationControlStateForTest()
  await clearNotificationDeadLetters()

  const center = await getAdminNotificationControlCenter()

  assert.ok(center.templates.length >= 8)
  assert.ok(center.templates.some((template) => template.event === 'order_shipped'))
  assert.equal(typeof center.status.ready, 'boolean')
})

test('notification template channel controls can be updated', async () => {
  await clearAdminNotificationControlStateForTest()

  const updated = await updateAdminNotificationTemplate(
    'order_shipped',
    {
      enabled: false,
      channels: { push: true, email: false },
      subject: { en: 'Shipping update', ar: 'Shipping update' },
    },
    actor,
  )

  assert.equal(updated.enabled, false)
  assert.equal(updated.channels.push, true)
  assert.equal(updated.channels.email, false)
  assert.equal(updated.subject.en, 'Shipping update')
  assert.equal(updated.updatedBy?.email, actor.email)
})

test('test campaign sends through NotificationProvider channels', async () => {
  await clearAdminNotificationControlStateForTest()
  const originalSend = notificationProvider.sendToUser
  const captured: unknown[] = []

  notificationProvider.sendToUser = async (message) => {
    captured.push(message)
    return {
      ok: true,
      data: {
        id: `delivery-${captured.length}`,
        provider: message.channel === 'email' ? 'email' : 'mock',
        status: 'sent',
        tokenCount: 1,
      },
    }
  }

  try {
    const campaign = await createAdminNotificationCampaign(
      {
        name: 'QA send',
        audience: 'test_user',
        userId: 'customer-1',
        recipientEmail: 'customer@example.com',
        channels: { push: true, email: true },
        title: 'Hello',
        body: 'Body',
      },
      actor,
    )

    assert.equal(campaign.status, 'sent')
    assert.equal(campaign.deliveries.length, 2)
    assert.equal(captured.length, 2)
  } finally {
    notificationProvider.sendToUser = originalSend
  }
})

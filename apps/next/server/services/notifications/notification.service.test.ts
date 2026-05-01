import { test } from 'node:test'
import assert from 'node:assert/strict'
import { notificationProvider } from '@real/providers'
import {
  getNotificationStatus,
  registerPushDevice,
  sendOrderStatusNotification,
  sendUserEmailNotification,
} from './notification.service'
import {
  clearNotificationDeadLetters,
  listNotificationDeadLetters,
} from './notification-dead-letter.service'

test('registerPushDevice delegates token registration to NotificationProvider', async () => {
  const originalRegister = notificationProvider.registerDevice
  let captured: unknown = null

  notificationProvider.registerDevice = async (input) => {
    captured = input
    return {
      ok: true,
      data: {
        ...input,
        id: 'push-test',
        registeredAt: '2026-04-29T00:00:00.000Z',
        updatedAt: '2026-04-29T00:00:00.000Z',
      },
    }
  }

  try {
    const result = await registerPushDevice({
      userId: 'u-1',
      token: 'ExponentPushToken[test]',
      platform: 'ios',
      locale: 'en',
    })

    assert.equal(result.id, 'push-test')
    assert.deepEqual(captured, {
      tenantId: undefined,
      userId: 'u-1',
      token: 'ExponentPushToken[test]',
      platform: 'ios',
      deviceId: undefined,
      locale: 'en',
    })
  } finally {
    notificationProvider.registerDevice = originalRegister
  }
})

test('sendOrderStatusNotification delegates order events to NotificationProvider', async () => {
  const originalSend = notificationProvider.sendOrderStatusUpdate
  let captured: unknown = null

  notificationProvider.sendOrderStatusUpdate = async (input) => {
    captured = input
    return {
      ok: true,
      data: {
        id: 'notif-test',
        provider: 'mock',
        status: 'sent',
        tokenCount: 1,
      },
    }
  }

  try {
    const result = await sendOrderStatusNotification({
      userId: 'u-1',
      orderId: 'ord-1',
      status: 'shipped',
    })

    assert.equal(result.status, 'sent')
    assert.deepEqual(captured, {
      userId: 'u-1',
      orderId: 'ord-1',
      status: 'shipped',
    })
  } finally {
    notificationProvider.sendOrderStatusUpdate = originalSend
  }
})

test('sendUserEmailNotification delegates email channel to NotificationProvider', async () => {
  const originalSend = notificationProvider.sendToUser
  let captured: unknown = null

  notificationProvider.sendToUser = async (input) => {
    captured = input
    return {
      ok: true,
      data: {
        id: 'email-test',
        provider: 'email',
        status: 'sent',
        tokenCount: 1,
      },
    }
  }

  try {
    const result = await sendUserEmailNotification({
      userId: 'u-1',
      recipientEmail: 'customer@example.com',
      title: 'Order update',
      body: 'Your order shipped.',
      data: { orderId: 'ord-1' },
    })

    assert.equal(result.provider, 'email')
    assert.deepEqual(captured, {
      tenantId: undefined,
      userId: 'u-1',
      recipientEmail: 'customer@example.com',
      channel: 'email',
      title: 'Order update',
      body: 'Your order shipped.',
      data: { orderId: 'ord-1' },
    })
  } finally {
    notificationProvider.sendToUser = originalSend
  }
})

test('failed notification deliveries are stored for retry', async () => {
  const originalSend = notificationProvider.sendOrderStatusUpdate
  await clearNotificationDeadLetters()

  notificationProvider.sendOrderStatusUpdate = async () => {
    return {
      ok: true,
      data: {
        id: 'failed-delivery',
        provider: 'expo-push',
        status: 'failed',
        tokenCount: 1,
        error: 'Expo push API returned 500.',
      },
    }
  }

  try {
    await sendOrderStatusNotification({
      userId: 'u-1',
      orderId: 'ord-1',
      status: 'shipped',
    })
    const records = await listNotificationDeadLetters()
    assert.equal(records.length, 1)
    assert.equal(records[0]?.provider, 'expo-push')
    assert.equal(records[0]?.retryCount, 0)
    assert.ok(records[0]?.nextRetryAt)
  } finally {
    notificationProvider.sendOrderStatusUpdate = originalSend
    await clearNotificationDeadLetters()
  }
})

test('getNotificationStatus exposes provider health and retry backlog', async () => {
  const originalHealth = notificationProvider.health
  await clearNotificationDeadLetters()

  notificationProvider.health = async () => {
    return { ok: true, data: { provider: 'multi-channel', ready: true } }
  }

  try {
    const status = await getNotificationStatus()
    assert.equal(status.provider, 'multi-channel')
    assert.equal(status.ready, true)
    assert.equal(status.deadLetterCount, 0)
  } finally {
    notificationProvider.health = originalHealth
  }
})

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createEmailNotificationAdapter } from './index'

test('email notification adapter posts email payload to configured endpoint', async () => {
  const originalFetch = globalThis.fetch
  const requests: Array<{ url: string; body?: string; authorization?: string }> = []

  globalThis.fetch = async (input, init) => {
    requests.push({
      url: String(input),
      body: typeof init?.body === 'string' ? init.body : undefined,
      authorization: init?.headers instanceof Headers ? init.headers.get('Authorization') ?? undefined : undefined,
    })
    return new Response(JSON.stringify({ id: 'mail-1' }), { status: 200 })
  }

  try {
    const adapter = createEmailNotificationAdapter({
      endpoint: 'https://email.example.com/messages',
      apiKey: 'secret',
      from: 'no-reply@example.com',
    })

    const result = await adapter.sendToUser({
      channel: 'email',
      recipientEmail: 'customer@example.com',
      title: 'Order update',
      body: 'Your order shipped.',
    })

    assert.equal(result.ok, true)
    if (!result.ok) return
    assert.equal(result.data.status, 'sent')
    assert.equal(requests[0]?.url, 'https://email.example.com/messages')
    const body = JSON.parse(requests[0]?.body ?? '{}')
    assert.equal(body.from, 'no-reply@example.com')
    assert.equal(body.to, 'customer@example.com')
    assert.equal(body.subject, 'Order update')
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('email notification adapter skips when recipient is missing', async () => {
  const adapter = createEmailNotificationAdapter({
    endpoint: 'https://email.example.com/messages',
    from: 'no-reply@example.com',
  })

  const result = await adapter.sendToUser({
    channel: 'email',
    title: 'Order update',
    body: 'Your order shipped.',
  })

  assert.equal(result.ok, true)
  if (!result.ok) return
  assert.equal(result.data.status, 'skipped')
})

import { NextRequest, NextResponse } from 'next/server'
import { processNetworksWebhook } from '../../../../../server/services/payments/networks-webhook.service'

export async function POST(request: NextRequest) {
  try {
    const result = await processNetworksWebhook(request)

  if (result.kind === 'not-configured') {
    return NextResponse.json({ error: 'Networks payment not configured' }, { status: 503 })
  }

  if (result.kind === 'missing-signature') {
    return NextResponse.json({ error: 'Missing webhook signature' }, { status: 400 })
  }

  if (result.kind === 'invalid-payload') {
    return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 })
  }

  if (result.kind === 'webhook-error') {
    return NextResponse.json({ error: result.message }, { status: 422 })
  }

  return NextResponse.json({ received: true, orderId: result.orderId })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

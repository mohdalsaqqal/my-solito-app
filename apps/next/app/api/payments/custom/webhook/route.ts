import { NextRequest, NextResponse } from 'next/server'
import { processCustomPaymentWebhook } from '../../../../../server/services/payments/custom-payment-webhook.service'

export async function POST(request: NextRequest) {
  try {
    const result = await processCustomPaymentWebhook(request)

  if (result.kind === 'not-configured') {
    return NextResponse.json({ error: 'Custom payment webhook is not configured' }, { status: 503 })
  }

  if (result.kind === 'webhook-error') {
    return NextResponse.json({ error: result.message }, { status: 422 })
  }

  if (result.kind === 'settlement-error') {
    return NextResponse.json({ error: result.message }, { status: 502 })
  }

  return NextResponse.json({
    received: true,
    orderId: result.orderId,
    intentId: result.intentId,
    settlementRecorded: result.settlementRecorded,
  })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

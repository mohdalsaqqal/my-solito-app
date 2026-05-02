import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const orderId = url.searchParams.get('orderId') ?? ''
  const redirectUrl = new URL('/checkout/success', url.origin)
  if (orderId) redirectUrl.searchParams.set('orderId', orderId)
  redirectUrl.searchParams.set('paymentStatus', url.searchParams.get('status') ?? 'pending')
  return NextResponse.redirect(redirectUrl)
}

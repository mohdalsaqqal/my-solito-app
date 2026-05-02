import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const redirectUrl = new URL('/checkout', url.origin)
  const orderId = url.searchParams.get('orderId')
  if (orderId) redirectUrl.searchParams.set('cancelledOrderId', orderId)
  redirectUrl.searchParams.set('paymentStatus', 'cancelled')
  return NextResponse.redirect(redirectUrl)
}

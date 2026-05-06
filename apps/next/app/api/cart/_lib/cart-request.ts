import { withCartScope } from '@real/providers'
import { resolveNormalizedSessionFromRequest } from '../../../../server/services/auth'
import { requireTrustedMutationRequest } from '../../_lib/request-auth'

const CART_COOKIE = 'rc_cart_id'
const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30

function readCookie(cookieHeader: string | null, name: string) {
  if (!cookieHeader) return null
  const prefix = `${name}=`
  const pair = cookieHeader
    .split(';')
    .map((item) => item.trim())
    .find((item) => item.startsWith(prefix))
  return pair ? decodeURIComponent(pair.slice(prefix.length)) : null
}

function createGuestCartId() {
  return crypto.randomUUID()
}

function buildGuestCartCookie(cartId: string) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  return `${CART_COOKIE}=${encodeURIComponent(cartId)}; Path=/; SameSite=Lax; Max-Age=${CART_COOKIE_MAX_AGE}${secure}`
}

function appendGuestCookie(response: Response, cookie: string | null) {
  if (cookie) {
    response.headers.append('Set-Cookie', cookie)
  }
  return response
}

export async function runCartRequest<T extends Response>(
  request: Request,
  callback: () => Promise<T>,
  options: { mutation?: boolean } = {},
) {
  if (options.mutation) {
    const trustedError = requireTrustedMutationRequest(request)
    if (trustedError) return trustedError
  }

  const session = await resolveNormalizedSessionFromRequest(request)
  if (session) {
    return withCartScope(`user:${session.userId}`, callback)
  }

  const cookieCartId = readCookie(request.headers.get('cookie'), CART_COOKIE)
  const cartId = cookieCartId || createGuestCartId()
  const response = await withCartScope(`guest:${cartId}`, callback)
  return appendGuestCookie(response, cookieCartId ? null : buildGuestCartCookie(cartId))
}

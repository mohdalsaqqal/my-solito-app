import type { AuthSession as NormalizedAuthSession, AuthRole } from '@real/providers/contracts'
import { auth } from '../../../lib/auth'
import {
  parseAuthSessionCookie,
  readAuthSessionCookieValue,
} from '../../../app/api/_lib/auth-session'
import { resolveAppOwnedRoleForUser } from './auth-role-resolution.service'

type BetterAuthUser = {
  id: string
  email: string
  name: string
}

type BetterAuthSessionResult = {
  user: BetterAuthUser
} | null

function toHeaders(input: Headers | HeadersInit) {
  return input instanceof Headers ? input : new Headers(input)
}

function toNormalizedSession(user: BetterAuthUser, role: AuthRole): NormalizedAuthSession {
  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    role,
  }
}

export async function resolveBetterAuthIdentity(
  headers: Headers | HeadersInit,
): Promise<BetterAuthSessionResult> {
  const resolved = await auth.api.getSession({
    headers: toHeaders(headers),
  })

  if (!resolved?.user) {
    return null
  }

  return {
    user: {
      id: resolved.user.id,
      email: resolved.user.email,
      name: resolved.user.name,
    },
  }
}

export async function resolveNormalizedSessionFromHeaders(
  headers: Headers | HeadersInit,
): Promise<NormalizedAuthSession | null> {
  const identity = await resolveBetterAuthIdentity(headers)
  if (!identity) {
    return null
  }

  const role = await resolveAppOwnedRoleForUser(identity.user)
  return toNormalizedSession(identity.user, role)
}

export async function resolveNormalizedSessionFromRequest(
  request: Request,
  options?: { allowLegacyFallback?: boolean },
): Promise<NormalizedAuthSession | null> {
  const betterAuthSession = await resolveNormalizedSessionFromHeaders(request.headers)
  if (betterAuthSession) {
    return betterAuthSession
  }

  if (options?.allowLegacyFallback === false) {
    return null
  }

  const cookieValue = readAuthSessionCookieValue(request.headers.get('cookie'))
  const legacySession = parseAuthSessionCookie(cookieValue)
  if (!legacySession) {
    return null
  }

  // T038: warn during the transition window so legacy session usage is visible
  // in server logs. Remove once T039 (legacy session deprecation) is complete.
  if (process.env.NODE_ENV !== 'test') {
    console.warn('[auth] legacy-session-fallback: request resolved via legacy cookie', {
      path: new URL(request.url).pathname,
      userId: legacySession.userId,
    })
  }

  return {
    userId: legacySession.userId,
    email: legacySession.email,
    name: legacySession.name,
    role: legacySession.role,
  }
}

export async function buildCookieHeaderFromBetterAuthSetCookie(
  setCookieHeader: string | null,
  fallbackHeaders?: Headers | HeadersInit,
) {
  const headers = toHeaders(fallbackHeaders ?? {})
  if (!setCookieHeader) {
    return headers
  }

  const cookieValue = setCookieHeader.split(';', 1)[0]
  if (cookieValue) {
    headers.set('cookie', cookieValue)
  }

  return headers
}

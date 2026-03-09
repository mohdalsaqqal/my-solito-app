import { AuthSession } from '@real/app/lib/types'
import { AUTH_SESSION_COOKIE, parseAuthSessionCookie } from './auth-session'
import { AdminDomain, hasAdminDomainPermission } from './admin-rbac'
import { fail } from './response'

function readCookieHeader(request: Request) {
  return request.headers.get('cookie') ?? ''
}

function readCookieValue(cookieHeader: string, cookieName: string) {
  if (!cookieHeader) {
    return null
  }

  const parts = cookieHeader.split(';')
  for (const rawPart of parts) {
    const part = rawPart.trim()
    if (!part.startsWith(`${cookieName}=`)) {
      continue
    }
    return part.slice(cookieName.length + 1)
  }

  return null
}

export function requireAuthSession(request: Request): AuthSession | Response {
  const cookieHeader = readCookieHeader(request)
  const cookieValue = readCookieValue(cookieHeader, AUTH_SESSION_COOKIE)
  const session = parseAuthSessionCookie(cookieValue)
  if (!session) {
    return fail('AUTH_REQUIRED', 'Authentication is required.', 401)
  }
  return session
}

export function requireAdminDomainSession(
  request: Request,
  domain: AdminDomain,
  required: 'read' | 'full' = 'read'
): AuthSession | Response {
  const session = requireAuthSession(request)
  if (session instanceof Response) {
    return session
  }
  if (!hasAdminDomainPermission(session.role, domain, required)) {
    return fail('AUTH_FORBIDDEN', 'Permission denied for this admin area.', 403)
  }
  return session
}

export function requireAdminAnyDomainSession(
  request: Request,
  domains: readonly AdminDomain[],
  required: 'read' | 'full' = 'read'
): AuthSession | Response {
  const session = requireAuthSession(request)
  if (session instanceof Response) {
    return session
  }
  const allowed = domains.some((domain) =>
    hasAdminDomainPermission(session.role, domain, required)
  )
  if (!allowed) {
    return fail('AUTH_FORBIDDEN', 'Permission denied for this admin area.', 403)
  }
  return session
}

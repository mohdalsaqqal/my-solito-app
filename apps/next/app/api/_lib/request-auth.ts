import { AuthSession } from '@real/app/lib/types'
import { parseAuthSessionCookie, readAuthSessionCookieValue } from './auth-session'
import { AdminDomain, hasAdminDomainPermission } from './admin-rbac'
import { fail } from './response'
import { isMutationMethod, TRUSTED_REQUEST_BYPASS_HEADER } from './security-policy'

type RequireSessionOptions = {
  skipTrustedRequestCheck?: boolean
}

export function requireAuthSession(request: Request): AuthSession | Response {
  const trustedRequestError = requireTrustedMutationRequest(request)
  if (trustedRequestError) {
    return trustedRequestError
  }

  const cookieValue = readAuthSessionCookieValue(request.headers.get('cookie'))
  const session = parseAuthSessionCookie(cookieValue)
  if (!session) {
    return fail('AUTH_REQUIRED', 'Authentication is required.', 401)
  }
  return session
}

export function requireAdminDomainSession(
  request: Request,
  domain: AdminDomain,
  required: 'read' | 'full' = 'read',
  options?: RequireSessionOptions
): AuthSession | Response {
  const session = requireAuthSessionWithOptions(request, options)
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
  required: 'read' | 'full' = 'read',
  options?: RequireSessionOptions
): AuthSession | Response {
  const session = requireAuthSessionWithOptions(request, options)
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

function requireAuthSessionWithOptions(
  request: Request,
  options?: RequireSessionOptions
): AuthSession | Response {
  if (!options?.skipTrustedRequestCheck) {
    const trustedRequestError = requireTrustedMutationRequest(request)
    if (trustedRequestError) {
      return trustedRequestError
    }
  }

  const cookieValue = readAuthSessionCookieValue(request.headers.get('cookie'))
  const session = parseAuthSessionCookie(cookieValue)
  if (!session) {
    return fail('AUTH_REQUIRED', 'Authentication is required.', 401)
  }
  return session
}

function hasTrustedOriginContext(request: Request): boolean {
  let requestOrigin: string
  try {
    requestOrigin = new URL(request.url).origin
  } catch {
    return false
  }

  const origin = request.headers.get('origin')
  if (origin) {
    return origin === requestOrigin
  }

  const referer = request.headers.get('referer')
  if (referer) {
    return referer.startsWith(`${requestOrigin}/`) || referer === requestOrigin
  }

  return false
}

function hasTrustedFetchMetadata(request: Request): boolean {
  const fetchSite = request.headers.get('sec-fetch-site')
  if (!fetchSite) {
    return false
  }

  return fetchSite === 'same-origin' || fetchSite === 'none'
}

export function requireTrustedMutationRequest(request: Request): Response | null {
  if (!isMutationMethod(request.method)) {
    return null
  }

  if (request.headers.get(TRUSTED_REQUEST_BYPASS_HEADER) === '1') {
    return null
  }

  if (!hasTrustedFetchMetadata(request) || !hasTrustedOriginContext(request)) {
    return fail(
      'AUTH_UNTRUSTED_REQUEST',
      'Cross-site or untrusted request context is not allowed for this operation.',
      403
    )
  }

  return null
}

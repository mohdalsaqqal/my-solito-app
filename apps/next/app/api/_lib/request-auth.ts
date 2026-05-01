import { AdminDomainPermissionSet, AuthSession } from '@real/app/lib/types'
import { AdminDomain, hasAdminDomainPermission } from './admin-rbac'
import { readAdminControlsState } from './admin-controls-store'
import { fail } from './response'
import { ensureRequestConnection } from './route-connection'
import {
  getTrustedRequestBypassSecret,
  isMutationMethod,
  TRUSTED_REQUEST_BYPASS_HEADER,
} from './security-policy'
import { resolveNormalizedSessionFromRequest } from '../../../server/services/auth'

type RequireSessionOptions = {
  skipTrustedRequestCheck?: boolean
}

export async function requireAuthSession(request: Request): Promise<AuthSession | Response> {
  const trustedRequestError = requireTrustedMutationRequest(request)
  if (trustedRequestError) {
    return trustedRequestError
  }

  const session = await resolveNormalizedSessionFromRequest(request)
  if (!session) {
    return fail('AUTH_REQUIRED', 'Authentication is required.', 401)
  }
  return session
}

async function resolveUserDomainPermissions(
  userId: string
): Promise<Partial<AdminDomainPermissionSet> | undefined> {
  const state = await readAdminControlsState()
  return state.userOverrides[userId]?.domainPermissions as
    | Partial<AdminDomainPermissionSet>
    | undefined
}

export async function requireAdminDomainSession(
  request: Request,
  domain: AdminDomain,
  required: 'read' | 'full' = 'read',
  options?: RequireSessionOptions
): Promise<AuthSession | Response> {
  const session = await requireAuthSessionWithOptions(request, options)
  if (session instanceof Response) {
    return session
  }
  const customPermissions = await resolveUserDomainPermissions(session.userId)
  if (!hasAdminDomainPermission(session.role, domain, required, customPermissions)) {
    return fail('AUTH_FORBIDDEN', 'Permission denied for this admin area.', 403)
  }
  return session
}

export async function requireAdminAnyDomainSession(
  request: Request,
  domains: readonly AdminDomain[],
  required: 'read' | 'full' = 'read',
  options?: RequireSessionOptions
): Promise<AuthSession | Response> {
  const session = await requireAuthSessionWithOptions(request, options)
  if (session instanceof Response) {
    return session
  }
  const customPermissions = await resolveUserDomainPermissions(session.userId)
  const allowed = domains.some((domain) =>
    hasAdminDomainPermission(session.role, domain, required, customPermissions)
  )
  if (!allowed) {
    return fail('AUTH_FORBIDDEN', 'Permission denied for this admin area.', 403)
  }
  return session
}

async function requireAuthSessionWithOptions(
  request: Request,
  options?: RequireSessionOptions
): Promise<AuthSession | Response> {
  await ensureRequestConnection()

  if (!options?.skipTrustedRequestCheck) {
    const trustedRequestError = requireTrustedMutationRequest(request)
    if (trustedRequestError) {
      return trustedRequestError
    }
  }

  const session = await resolveNormalizedSessionFromRequest(request)
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

  const bypassSecret = getTrustedRequestBypassSecret()
  if (bypassSecret && request.headers.get(TRUSTED_REQUEST_BYPASS_HEADER) === bypassSecret) {
    return null
  }

  const fetchSite = request.headers.get('sec-fetch-site')
  if (fetchSite === 'same-origin' || fetchSite === 'none') {
    return null
  }

  if (!hasTrustedOriginContext(request)) {
    return fail(
      'AUTH_UNTRUSTED_REQUEST',
      'Cross-site or untrusted request context is not allowed for this operation.',
      403
    )
  }

  return null
}

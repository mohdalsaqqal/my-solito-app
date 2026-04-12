export const AUTH_SESSION_COOKIE = 'rc_auth_session'
export const AUTH_SESSION_FALLBACK_SECRET = 'dev-auth-secret-change-me'
export const AUTH_SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60
export const TRUSTED_REQUEST_BYPASS_HEADER = 'x-rc-trusted-request'

const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

function normalizeBooleanEnv(value: string | undefined): boolean | null {
  if (!value) return null
  const normalized = value.trim().toLowerCase()
  if (normalized === 'true' || normalized === '1') return true
  if (normalized === 'false' || normalized === '0') return false
  return null
}

export function isMutationMethod(method: string | undefined): boolean {
  if (!method) return false
  return MUTATION_METHODS.has(method.toUpperCase())
}

export function isSecureCookieRequired() {
  const forced = normalizeBooleanEnv(process.env.AUTH_COOKIE_SECURE)
  if (forced !== null) return forced
  return process.env.NODE_ENV === 'production'
}

export function isReleaseLikeEnvironment() {
  const forced = normalizeBooleanEnv(process.env.REQUIRE_PRODUCTION_AUTH)
  if (forced !== null) return forced

  const appEnv = process.env.APP_ENV?.trim().toLowerCase()
  if (appEnv === 'production' || appEnv === 'staging') {
    return true
  }

  return process.env.NODE_ENV === 'production'
}

export function getAuthSessionSecret(): string | null {
  const configured = process.env.AUTH_SESSION_SECRET?.trim()
  if (configured) {
    return configured
  }
  if (isReleaseLikeEnvironment()) {
    return null
  }
  return AUTH_SESSION_FALLBACK_SECRET
}

export function isAuthSessionConfigValid() {
  return getAuthSessionSecret() !== null
}

export function buildCookieAttributes(maxAgeSeconds: number) {
  const secure = isSecureCookieRequired() ? '; Secure' : ''
  return `Path=/; HttpOnly; SameSite=Lax${secure}; Max-Age=${maxAgeSeconds}`
}


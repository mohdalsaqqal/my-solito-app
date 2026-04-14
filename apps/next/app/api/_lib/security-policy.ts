export const AUTH_SESSION_COOKIE = 'rc_auth_session'
export const AUTH_SESSION_FALLBACK_SECRET = 'dev-auth-secret-change-me'
export const AUTH_SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60
export const TRUSTED_REQUEST_BYPASS_HEADER = 'x-rc-trusted-request'
export const BETTER_AUTH_FALLBACK_URL = 'http://localhost:3000'
export const MINIMUM_AUTH_SECRET_LENGTH = 32

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

export function getBetterAuthSecret(): string | null {
  const configured = process.env.BETTER_AUTH_SECRET?.trim()
  if (configured) {
    if (isReleaseLikeEnvironment() && !isAuthSecretStrongEnough(configured)) {
      return null
    }

    return configured
  }

  if (isReleaseLikeEnvironment()) {
    return null
  }

  const fallback = getAuthSessionSecret()
  if (!fallback) {
    return null
  }

  return fallback
}

export function isBetterAuthConfigValid() {
  return getBetterAuthSecret() !== null
}

export function isAuthSecretStrongEnough(secret: string | null | undefined) {
  if (!secret) {
    return false
  }

  return secret.trim().length >= MINIMUM_AUTH_SECRET_LENGTH
}

export function getBetterAuthBaseUrl() {
  const configured =
    process.env.BETTER_AUTH_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.APP_BASE_URL?.trim()

  if (configured) {
    return configured
  }

  return BETTER_AUTH_FALLBACK_URL
}

export function getBetterAuthTrustedOrigins() {
  const configured = process.env.BETTER_AUTH_TRUSTED_ORIGINS?.trim()
  if (!configured) {
    return [getBetterAuthBaseUrl()]
  }

  const origins = configured
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)

  if (!origins.includes(getBetterAuthBaseUrl())) {
    origins.push(getBetterAuthBaseUrl())
  }

  return origins
}

export function buildCookieAttributes(maxAgeSeconds: number) {
  const secure = isSecureCookieRequired() ? '; Secure' : ''
  return `Path=/; HttpOnly; SameSite=Lax${secure}; Max-Age=${maxAgeSeconds}`
}

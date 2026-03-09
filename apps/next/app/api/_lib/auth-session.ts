import { AuthSession } from '@real/app/lib/types'
import { createHmac } from 'node:crypto'

export const AUTH_SESSION_COOKIE = 'rc_auth_session'
const AUTH_SESSION_FALLBACK_SECRET = 'dev-auth-secret-change-me'
const VALID_AUTH_ROLES = new Set([
  'customer',
  'pharmacist',
  'admin',
  'marketing',
  'catalog',
  'support',
  'ops',
])

function isAuthRole(input: unknown): input is AuthSession['role'] {
  return typeof input === 'string' && VALID_AUTH_ROLES.has(input)
}

export function getAuthSessionSecret() {
  return process.env.AUTH_SESSION_SECRET || AUTH_SESSION_FALLBACK_SECRET
}

function signSessionPayload(payloadBase64: string, secret: string) {
  return createHmac('sha256', secret).update(payloadBase64).digest('base64url')
}

export function parseAuthSessionCookie(value?: string | null): AuthSession | null {
  if (!value) {
    return null
  }

  try {
    const [payloadBase64, signature] = value.split('.')
    if (!payloadBase64 || !signature) {
      return null
    }
    const expected = signSessionPayload(payloadBase64, getAuthSessionSecret())
    if (signature !== expected) {
      return null
    }

    const decoded = Buffer.from(payloadBase64, 'base64url').toString('utf8')
    const parsed = JSON.parse(decoded) as Partial<AuthSession>
    if (
      typeof parsed.userId !== 'string' ||
      typeof parsed.email !== 'string' ||
      typeof parsed.name !== 'string' ||
      !isAuthRole(parsed.role)
    ) {
      return null
    }

    return {
      userId: parsed.userId,
      email: parsed.email,
      name: parsed.name,
      role: parsed.role,
    }
  } catch {
    return null
  }
}

export function buildAuthSessionCookieHeader(session: AuthSession) {
  const payloadBase64 = Buffer.from(JSON.stringify(session), 'utf8').toString('base64url')
  const signature = signSessionPayload(payloadBase64, getAuthSessionSecret())
  return `${AUTH_SESSION_COOKIE}=${payloadBase64}.${signature}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`
}

export function clearAuthSessionCookieHeader() {
  return `${AUTH_SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
}

export function jsonOk<T>(data: T, status = 200, setCookie?: string) {
  const payload: { success: true; data: T } = {
    success: true,
    data,
  }

  return Response.json(payload, {
    status,
    headers: setCookie ? { 'Set-Cookie': setCookie } : undefined,
  })
}

export function jsonFail(
  code: string,
  message: string,
  status = 400,
  setCookie?: string
) {
  const payload: { success: false; error: { code: string; message: string } } = {
    success: false,
    error: {
      code,
      message,
    },
  }

  return Response.json(payload, {
    status,
    headers: setCookie ? { 'Set-Cookie': setCookie } : undefined,
  })
}

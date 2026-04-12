import { AuthSession } from '@real/app/lib/types'
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from 'node:crypto'
import {
  AUTH_SESSION_COOKIE,
  AUTH_SESSION_MAX_AGE_SECONDS,
  buildCookieAttributes,
  getAuthSessionSecret,
  isAuthSessionConfigValid,
} from './security-policy'

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

function signSessionPayload(payloadBase64: string, secret: string) {
  return createHmac('sha256', secret).update(payloadBase64).digest('base64url')
}

function deriveEncryptionKey(secret: string) {
  return createHash('sha256').update(secret).digest()
}

function encryptSessionPayload(payload: AuthSession & { sessionId: string; csrfToken: string }) {
  const secret = getAuthSessionSecret()
  if (!secret) {
    throw new Error('AUTH_SESSION_SECRET is required for cookie issuance in this environment.')
  }

  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', deriveEncryptionKey(secret), iv)
  const plaintext = Buffer.from(JSON.stringify(payload), 'utf8')
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()])
  const tag = cipher.getAuthTag()

  return `v1.${iv.toString('base64url')}.${ciphertext.toString('base64url')}.${tag.toString('base64url')}`
}

function decryptSessionPayload(token: string, secret: string) {
  const [version, ivBase64, ciphertextBase64, tagBase64] = token.split('.')
  if (version !== 'v1' || !ivBase64 || !ciphertextBase64 || !tagBase64) {
    return null
  }

  try {
    const iv = Buffer.from(ivBase64, 'base64url')
    const ciphertext = Buffer.from(ciphertextBase64, 'base64url')
    const tag = Buffer.from(tagBase64, 'base64url')
    const decipher = createDecipheriv('aes-256-gcm', deriveEncryptionKey(secret), iv)
    decipher.setAuthTag(tag)
    const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()])
    return JSON.parse(plaintext.toString('utf8')) as Partial<AuthSession & { sessionId?: string; csrfToken?: string }>
  } catch {
    return null
  }
}

function parseLegacySignedSessionCookie(value: string, secret: string) {
  const [payloadBase64, signature] = value.split('.')
  if (!payloadBase64 || !signature) {
    return null
  }

  const expected = signSessionPayload(payloadBase64, secret)
  const signatureBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expected)
  if (signatureBuffer.length !== expectedBuffer.length) {
    return null
  }
  if (!timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return null
  }

  try {
    const decoded = Buffer.from(payloadBase64, 'base64url').toString('utf8')
    return JSON.parse(decoded) as Partial<AuthSession & { sessionId?: string; csrfToken?: string }>
  } catch {
    return null
  }
}

export function readAuthSessionCookieValue(cookieHeader?: string | null) {
  if (!cookieHeader) {
    return null
  }

  const parts = cookieHeader.split(';')
  for (const rawPart of parts) {
    const part = rawPart.trim()
    if (!part.startsWith(`${AUTH_SESSION_COOKIE}=`)) {
      continue
    }
    return part.slice(AUTH_SESSION_COOKIE.length + 1)
  }

  return null
}

export function parseAuthSessionCookie(value?: string | null): AuthSession & { sessionId?: string; csrfToken?: string } | null {
  if (!value) {
    return null
  }

  try {
    const secret = getAuthSessionSecret()
    if (!secret) {
      return null
    }

    const parsed = value.startsWith('v1.')
      ? decryptSessionPayload(value, secret)
      : parseLegacySignedSessionCookie(value, secret)
    if (!parsed) {
      return null
    }
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
      sessionId: parsed.sessionId,
      csrfToken: parsed.csrfToken,
    }
  } catch {
    return null
  }
}

export function buildAuthSessionCookieHeader(session: AuthSession) {
  // Include a unique session ID and CSRF token for session rotation
  const enrichedSession: AuthSession & { sessionId: string; csrfToken: string } = {
    ...session,
    sessionId: randomBytes(16).toString('hex'),
    csrfToken: randomBytes(32).toString('hex'),
  }

  const encryptedToken = encryptSessionPayload(enrichedSession)
  return `${AUTH_SESSION_COOKIE}=${encryptedToken}; ${buildCookieAttributes(AUTH_SESSION_MAX_AGE_SECONDS)}`
}

export function clearAuthSessionCookieHeader() {
  return `${AUTH_SESSION_COOKIE}=; ${buildCookieAttributes(0)}`
}

export { getAuthSessionSecret, isAuthSessionConfigValid }
export { AUTH_SESSION_COOKIE }

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

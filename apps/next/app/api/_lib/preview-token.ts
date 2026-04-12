import crypto from 'node:crypto'
import { DEFAULT_STORE_ID } from './release-env'

const DEFAULT_TTL_SECONDS = 60 * 30

type PreviewPayload = {
  releaseId: string
  storeId: string
  versionId?: string
  exp: number
}

function isReleaseLikeEnvironment() {
  const appEnv = process.env.APP_ENV?.trim().toLowerCase()
  if (appEnv === 'production' || appEnv === 'staging') {
    return true
  }
  return process.env.NODE_ENV === 'production'
}

function getSecret(): string | null {
  const configured = process.env.PREVIEW_TOKEN_SECRET?.trim()
  if (configured) {
    return configured
  }
  if (isReleaseLikeEnvironment()) {
    return null
  }
  return 'dev-preview-secret'
}

function signPayload(payload: PreviewPayload, secret: string) {
  return crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex')
}

export function createPreviewToken(
  releaseId: string,
  storeId = DEFAULT_STORE_ID,
  ttlSeconds = DEFAULT_TTL_SECONDS,
  versionId?: string,
) {
  const payload: PreviewPayload = {
    releaseId,
    storeId,
    versionId: typeof versionId === 'string' && versionId.trim().length > 0 ? versionId.trim() : undefined,
    exp: Math.floor(Date.now() / 1000) + Math.max(10, ttlSeconds),
  }
  const secret = getSecret()
  if (!secret) {
    throw new Error('PREVIEW_TOKEN_SECRET is required in this environment.')
  }
  const signature = signPayload(payload, secret)
  const tokenPayload = JSON.stringify({ ...payload, signature })
  return Buffer.from(tokenPayload, 'utf8').toString('base64url')
}

export function verifyPreviewToken(token: string | null | undefined) {
  if (!token) {
    return { valid: false as const, reason: 'MISSING' }
  }
  const secret = getSecret()
  if (!secret) {
    return { valid: false as const, reason: 'CONFIG' }
  }

  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8')
    const parsed = JSON.parse(decoded) as PreviewPayload & { signature?: string }

    if (!parsed.releaseId || !parsed.storeId || typeof parsed.exp !== 'number' || !parsed.signature) {
      return { valid: false as const, reason: 'MALFORMED' }
    }

    if (parsed.exp < Math.floor(Date.now() / 1000)) {
      return { valid: false as const, reason: 'EXPIRED' }
    }

    const expected = signPayload({
      releaseId: parsed.releaseId,
      storeId: parsed.storeId,
      versionId: parsed.versionId,
      exp: parsed.exp,
    }, secret)

    const expectedBuf = Buffer.from(expected)
    const actualBuf = Buffer.from(parsed.signature)

    // Length check first: timingSafeEqual throws on different-length buffers
    if (expectedBuf.length !== actualBuf.length || !crypto.timingSafeEqual(expectedBuf, actualBuf)) {
      return { valid: false as const, reason: 'INVALID_SIGNATURE' }
    }

    return {
      valid: true as const,
      releaseId: parsed.releaseId,
      storeId: parsed.storeId,
      versionId: parsed.versionId,
    }
  } catch {
    return { valid: false as const, reason: 'MALFORMED' }
  }
}

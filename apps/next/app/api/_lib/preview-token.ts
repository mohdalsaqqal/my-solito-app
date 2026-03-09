import crypto from 'node:crypto'

const DEFAULT_TTL_SECONDS = 60 * 30

type PreviewPayload = {
  releaseId: string
  exp: number
}

function getSecret() {
  return process.env.PREVIEW_TOKEN_SECRET || process.env.ODOO_SECRET || 'dev-preview-secret'
}

function signPayload(payload: PreviewPayload) {
  return crypto
    .createHmac('sha256', getSecret())
    .update(JSON.stringify(payload))
    .digest('hex')
}

export function createPreviewToken(releaseId: string, ttlSeconds = DEFAULT_TTL_SECONDS) {
  const payload: PreviewPayload = {
    releaseId,
    exp: Math.floor(Date.now() / 1000) + Math.max(10, ttlSeconds),
  }
  const signature = signPayload(payload)
  const tokenPayload = JSON.stringify({ ...payload, signature })
  return Buffer.from(tokenPayload, 'utf8').toString('base64url')
}

export function verifyPreviewToken(token: string | null | undefined) {
  if (!token) {
    return { valid: false as const, reason: 'MISSING' }
  }

  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8')
    const parsed = JSON.parse(decoded) as PreviewPayload & { signature?: string }

    if (!parsed.releaseId || typeof parsed.exp !== 'number' || !parsed.signature) {
      return { valid: false as const, reason: 'MALFORMED' }
    }

    if (parsed.exp < Math.floor(Date.now() / 1000)) {
      return { valid: false as const, reason: 'EXPIRED' }
    }

    const expected = signPayload({ releaseId: parsed.releaseId, exp: parsed.exp })
    if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(parsed.signature))) {
      return { valid: false as const, reason: 'INVALID_SIGNATURE' }
    }

    return {
      valid: true as const,
      releaseId: parsed.releaseId,
    }
  } catch {
    return { valid: false as const, reason: 'MALFORMED' }
  }
}

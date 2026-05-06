import { NextRequest, NextResponse } from 'next/server'
import { AUTH_SESSION_COOKIE, getAuthSessionSecret } from './app/api/_lib/security-policy'

type Role =
  | 'customer'
  | 'pharmacist'
  | 'admin'
  | 'marketing'
  | 'catalog'
  | 'support'
  | 'ops'

type SessionPayload = {
  userId: string
  email: string
  name: string
  role: Role
}

const LOCALE_COOKIE = 'rc_locale'
const SUPPORTED_LOCALES = ['en', 'ar'] as const

type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

const publicPrefixes = ['/', '/shop', '/sales', '/product', '/cart', '/checkout', '/auth', '/search']
const customerProtectedPrefixes = ['/account', '/orders', '/users']
const pharmacistPrefixes = ['/pharmacist', '/pharmasset']
const adminPrefixes = ['/admin']
const adminPanelRoles: Role[] = ['admin', 'marketing', 'catalog', 'support', 'ops']
const validRoles: Role[] = [...adminPanelRoles, 'customer', 'pharmacist']

function isRole(input: unknown): input is Role {
  return typeof input === 'string' && validRoles.includes(input as Role)
}

function base64UrlToBase64(input: string) {
  const withPadding = input.padEnd(Math.ceil(input.length / 4) * 4, '=')
  return withPadding.replace(/-/g, '+').replace(/_/g, '/')
}

function decodeBase64Url(input: string) {
  const base64 = base64UrlToBase64(input)
  const decoded = atob(base64)
  const bytes = new Uint8Array(decoded.length)
  for (let index = 0; index < decoded.length; index += 1) {
    bytes[index] = decoded.charCodeAt(index)
  }
  return new TextDecoder().decode(bytes)
}

function toBase64Url(bytes: Uint8Array) {
  let binary = ''
  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index] as number)
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function decodeBase64UrlBytes(input: string) {
  return Uint8Array.from(atob(base64UrlToBase64(input)), (char) => char.charCodeAt(0))
}

function normalizeLocale(input: string | null | undefined): SupportedLocale | null {
  if (!input) return null
  const normalized = input.trim().toLowerCase()
  if (!normalized) return null
  if (normalized.startsWith('ar')) return 'ar'
  if (normalized.startsWith('en')) return 'en'
  return null
}

function resolveLocaleForRequest(request: NextRequest): SupportedLocale {
  const fromQuery = normalizeLocale(request.nextUrl.searchParams.get('locale'))
  if (fromQuery) return fromQuery

  const fromCookie = normalizeLocale(request.cookies.get(LOCALE_COOKIE)?.value)
  if (fromCookie) return fromCookie

  const fromHeader = normalizeLocale(request.headers.get('accept-language'))
  if (fromHeader) return fromHeader

  return 'en'
}

function extractLocalePrefix(pathname: string): {
  locale: SupportedLocale | null
  pathname: string
} {
  const segments = pathname.split('/').filter(Boolean)
  const first = segments[0]
  if (!first || !SUPPORTED_LOCALES.includes(first as SupportedLocale)) {
    return { locale: null, pathname }
  }

  const rest = segments.slice(1).join('/')
  return {
    locale: first as SupportedLocale,
    pathname: rest ? `/${rest}` : '/',
  }
}

function localizePath(pathname: string, locale: SupportedLocale): string {
  if (!pathname.startsWith('/')) {
    return `/${locale}/${pathname}`
  }
  if (pathname === '/') {
    return `/${locale}`
  }
  return `/${locale}${pathname}`
}

async function signPayload(payloadBase64: string, secret: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payloadBase64))
  return toBase64Url(new Uint8Array(signature))
}

async function deriveEncryptionKey(secret: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(secret))
  return crypto.subtle.importKey('raw', digest, { name: 'AES-GCM' }, false, ['decrypt'])
}

async function decryptEncryptedPayload(raw: string, secret: string) {
  const [version, ivBase64, ciphertextBase64, tagBase64] = raw.split('.')
  if (version !== 'v1' || !ivBase64 || !ciphertextBase64 || !tagBase64) {
    return null
  }

  try {
    const iv = decodeBase64UrlBytes(ivBase64)
    const ciphertext = decodeBase64UrlBytes(ciphertextBase64)
    const tag = decodeBase64UrlBytes(tagBase64)
    const encrypted = new Uint8Array(ciphertext.length + tag.length)
    encrypted.set(ciphertext, 0)
    encrypted.set(tag, ciphertext.length)
    const key = await deriveEncryptionKey(secret)
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encrypted)
    return JSON.parse(new TextDecoder().decode(new Uint8Array(decrypted))) as Partial<SessionPayload>
  } catch {
    return null
  }
}

async function parseLegacySignedPayload(raw: string, secret: string) {
  const [payloadBase64, signature] = raw.split('.')
  if (!payloadBase64 || !signature) {
    return null
  }

  const expected = await signPayload(payloadBase64, secret)
  if (signature !== expected) {
    return null
  }

  try {
    const decoded = decodeBase64Url(payloadBase64)
    return JSON.parse(decoded) as Partial<SessionPayload>
  } catch {
    return null
  }
}

async function parseSessionCookie(raw: string | undefined): Promise<SessionPayload | null> {
  if (!raw) {
    return null
  }

  try {
    const secret = getAuthSessionSecret()
    if (!secret) {
      return null
    }

    const parsed = raw.startsWith('v1.')
      ? await decryptEncryptedPayload(raw, secret)
      : await parseLegacySignedPayload(raw, secret)
    if (!parsed) {
      return null
    }
    if (
      typeof parsed.userId !== 'string' ||
      typeof parsed.email !== 'string' ||
      typeof parsed.name !== 'string' ||
      !isRole(parsed.role)
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

function matchesPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}

function redirectTo(
  request: NextRequest,
  locale: SupportedLocale,
  pathname: string,
  nextPath?: string
) {
  const url = request.nextUrl.clone()
  url.pathname = localizePath(pathname, locale)
  if (nextPath) {
    url.searchParams.set('next', nextPath)
  }
  const response = NextResponse.redirect(url)
  response.cookies.set(LOCALE_COOKIE, locale, { path: '/', sameSite: 'lax', maxAge: 31536000 })
  return response
}

export async function proxy(request: NextRequest) {
  const extracted = extractLocalePrefix(request.nextUrl.pathname)
  const locale = extracted.locale ?? resolveLocaleForRequest(request)
  const pathname = extracted.pathname

  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    if (!extracted.locale) {
      return NextResponse.next()
    }

    const rewriteUrl = request.nextUrl.clone()
    rewriteUrl.pathname = pathname
    return NextResponse.rewrite(rewriteUrl)
  }

  if (!extracted.locale) {
    const nextUrl = request.nextUrl.clone()
    nextUrl.pathname = localizePath(pathname, locale)
    const response = NextResponse.redirect(nextUrl)
    response.cookies.set(LOCALE_COOKIE, locale, { path: '/', sameSite: 'lax', maxAge: 31536000 })
    return response
  }

  const BETTER_AUTH_COOKIES = [
    'better-auth.session_token',
    '__Secure-better-auth.session_token',
    '__Host-better-auth.session_token',
  ] as const

  const session = await parseSessionCookie(request.cookies.get(AUTH_SESSION_COOKIE)?.value)
  const hasBetterAuthCookie = BETTER_AUTH_COOKIES.some((cookieName) =>
    Boolean(request.cookies.get(cookieName)?.value)
  )
  const hasSession = Boolean(session) || hasBetterAuthCookie
  const sessionRole = session?.role

  // Route admin/ops users away from customer pages
  if (session && adminPanelRoles.includes(sessionRole as Role) && matchesPrefix(pathname, customerProtectedPrefixes)) {
    return redirectTo(request, locale, '/admin')
  }

  if (sessionRole === 'pharmacist' && matchesPrefix(pathname, customerProtectedPrefixes)) {
    return redirectTo(request, locale, '/pharmacist')
  }

  // Admin routes: require any session. Role enforcement is at the route level.
  if (matchesPrefix(pathname, adminPrefixes)) {
    if (!hasSession) {
      return redirectTo(request, locale, '/auth/login', request.nextUrl.pathname)
    }
    // If we have a legacy session with known role, enforce it.
    // Better Auth sessions pass through — routes enforce roles via request-auth.
    if (session && !adminPanelRoles.includes(sessionRole as Role)) {
      return redirectTo(request, locale, '/')
    }

    const rewriteUrl = request.nextUrl.clone()
    rewriteUrl.pathname = pathname
    const response = NextResponse.rewrite(rewriteUrl)
    response.cookies.set(LOCALE_COOKIE, locale, { path: '/', sameSite: 'lax', maxAge: 31536000 })
    return response
  }

  // Pharmacist routes
  if (matchesPrefix(pathname, pharmacistPrefixes)) {
    if (!hasSession) {
      return redirectTo(request, locale, '/auth/login', request.nextUrl.pathname)
    }
    if (session && sessionRole !== 'pharmacist' && sessionRole !== 'admin') {
      return redirectTo(request, locale, '/')
    }

    const rewriteUrl = request.nextUrl.clone()
    rewriteUrl.pathname = pathname
    const response = NextResponse.rewrite(rewriteUrl)
    response.cookies.set(LOCALE_COOKIE, locale, { path: '/', sameSite: 'lax', maxAge: 31536000 })
    return response
  }

  // Customer-protected routes
  if (matchesPrefix(pathname, customerProtectedPrefixes)) {
    if (!hasSession) {
      return redirectTo(request, locale, '/auth/login', request.nextUrl.pathname)
    }
  }

  // Redirect logged-in users away from auth pages
  if (pathname.startsWith('/auth') && hasSession) {
    if (session && adminPanelRoles.includes(sessionRole as Role)) {
      return redirectTo(request, locale, '/admin')
    }
    if (sessionRole === 'pharmacist') {
      return redirectTo(request, locale, '/pharmacist')
    }
    // Better Auth sessions without known role → go to account
    if (!session && hasBetterAuthCookie) {
      return redirectTo(request, locale, '/account')
    }
    if (session) {
      return redirectTo(request, locale, '/account')
    }
  }

  if (!matchesPrefix(pathname, publicPrefixes) && !matchesPrefix(pathname, customerProtectedPrefixes) && !matchesPrefix(pathname, adminPrefixes) && !matchesPrefix(pathname, pharmacistPrefixes)) {
    return redirectTo(request, locale, '/')
  }

  const rewriteUrl = request.nextUrl.clone()
  rewriteUrl.pathname = pathname
  const response = NextResponse.rewrite(rewriteUrl)
  response.cookies.set(LOCALE_COOKIE, locale, { path: '/', sameSite: 'lax', maxAge: 31536000 })
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

export type SupportedLocale = 'en' | 'ar'

const DEFAULT_LOCALE: SupportedLocale = 'en'
const LOCALE_COOKIE = 'rc_locale'

function normalizeLocale(value: string | null | undefined): SupportedLocale | null {
  if (!value) return null
  const normalized = value.trim().toLowerCase()
  if (!normalized) return null
  if (normalized.startsWith('ar')) return 'ar'
  if (normalized.startsWith('en')) return 'en'
  return null
}

function parseCookie(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) return {}
  return cookieHeader.split(';').reduce<Record<string, string>>((acc, token) => {
    const [rawKey, ...rawValue] = token.trim().split('=')
    if (!rawKey) return acc
    try {
      acc[rawKey] = decodeURIComponent(rawValue.join('='))
    } catch {
      acc[rawKey] = rawValue.join('=')
    }
    return acc
  }, {})
}

export function resolveRequestLocale(request: Request): SupportedLocale {
  const url = new URL(request.url)

  const fromQuery = normalizeLocale(url.searchParams.get('locale'))
  if (fromQuery) return fromQuery

  const cookies = parseCookie(request.headers.get('cookie'))
  const fromCookie = normalizeLocale(cookies[LOCALE_COOKIE])
  if (fromCookie) return fromCookie

  const fromHeader = normalizeLocale(request.headers.get('accept-language'))
  if (fromHeader) return fromHeader

  return DEFAULT_LOCALE
}

export function resolveLocaleFromInput(input: string | null | undefined): SupportedLocale {
  return normalizeLocale(input) ?? DEFAULT_LOCALE
}

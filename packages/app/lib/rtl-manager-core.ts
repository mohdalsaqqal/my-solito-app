export type SupportedLocale = 'en' | 'ar'
export type LayoutDirection = 'ltr' | 'rtl'

const DEFAULT_LOCALE: SupportedLocale = 'en'
const RTL_LANGUAGE_PREFIXES = ['ar', 'fa', 'he', 'ur'] as const

function normalizeLanguageTag(value: string | null | undefined) {
  return (value ?? '').trim().toLowerCase()
}

export function resolveLocale(input?: string | null): SupportedLocale {
  const normalized = normalizeLanguageTag(input)
  return normalized.startsWith('ar') ? 'ar' : DEFAULT_LOCALE
}

export function resolveLocaleFromAcceptLanguage(
  acceptLanguageHeader?: string | null
): SupportedLocale {
  const first = normalizeLanguageTag(acceptLanguageHeader).split(',')[0]
  return resolveLocale(first)
}

export function isRtlLocale(input?: string | null) {
  const locale = normalizeLanguageTag(input)
  if (!locale) return false
  return RTL_LANGUAGE_PREFIXES.some((prefix) => locale.startsWith(prefix))
}

export function resolveDirection(input?: string | null): LayoutDirection {
  return isRtlLocale(input) ? 'rtl' : 'ltr'
}

export function resolveLocaleAndDirectionFromAcceptLanguage(
  acceptLanguageHeader?: string | null
) {
  const locale = resolveLocaleFromAcceptLanguage(acceptLanguageHeader)
  return {
    locale,
    direction: resolveDirection(locale) as LayoutDirection,
  }
}

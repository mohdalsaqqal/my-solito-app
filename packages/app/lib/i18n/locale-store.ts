import { useSyncExternalStore } from 'react'
import { defaultLocale, supportedLocales, type AppLocale } from './config'

const COOKIE_KEY = 'rc_locale'

type Listener = () => void
const listeners = new Set<Listener>()

function normalizeLocale(input: string | null | undefined): AppLocale | null {
  if (!input) return null
  const normalized = input.trim().toLowerCase()
  if (!normalized) return null
  if (normalized.startsWith('ar')) return 'ar'
  if (normalized.startsWith('en')) return 'en'
  return null
}

function readLocaleFromCookie(): AppLocale | null {
  if (typeof document === 'undefined') return null
  const cookie = document.cookie
    .split(';')
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${COOKIE_KEY}=`))
  if (!cookie) return null
  const value = cookie.slice(COOKIE_KEY.length + 1)
  try {
    return normalizeLocale(decodeURIComponent(value))
  } catch {
    return normalizeLocale(value)
  }
}

function localizePath(pathname: string, locale: AppLocale): string {
  const segments = pathname.split('/').filter(Boolean)
  const first = segments[0]
  if (first === 'en' || first === 'ar') {
    segments[0] = locale
  } else {
    segments.unshift(locale)
  }
  return `/${segments.join('/')}`
}

function resolveInitialLocale(): AppLocale {
  if (typeof window !== 'undefined') {
    const fromQuery = normalizeLocale(new URL(window.location.href).searchParams.get('locale'))
    if (fromQuery) return fromQuery

    const fromCookie = readLocaleFromCookie()
    if (fromCookie) return fromCookie

    const fromHtml = normalizeLocale(document.documentElement.lang)
    if (fromHtml) return fromHtml

    const fromNavigator = normalizeLocale(window.navigator.language)
    if (fromNavigator) return fromNavigator
  }

  if (typeof Intl !== 'undefined') {
    const fromIntl = normalizeLocale(Intl.DateTimeFormat().resolvedOptions().locale)
    if (fromIntl) return fromIntl
  }

  return defaultLocale
}

let currentLocale: AppLocale = resolveInitialLocale()

function notify() {
  listeners.forEach((listener) => listener())
}

export function getCurrentLocale(): AppLocale {
  return currentLocale
}

export function setCurrentLocale(locale: AppLocale) {
  if (!supportedLocales.includes(locale)) return
  currentLocale = locale

  if (typeof document !== 'undefined') {
    document.documentElement.lang = locale
    document.cookie = `${COOKIE_KEY}=${encodeURIComponent(locale)}; path=/; max-age=31536000; SameSite=Lax`

    const nextPath = localizePath(window.location.pathname, locale)
    const nextUrl = `${nextPath}${window.location.search}${window.location.hash}`
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`
    if (currentUrl !== nextUrl) {
      window.location.assign(nextUrl)
      return
    }
  }

  notify()
}

export function subscribeLocale(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useCurrentLocale(): AppLocale {
  return useSyncExternalStore(subscribeLocale, getCurrentLocale, () => defaultLocale)
}

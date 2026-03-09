import { cookies, headers } from 'next/headers'
import { resolveLocaleFromInput, type SupportedLocale } from '../api/_lib/request-locale'

export async function resolvePageLocale(searchParams?: URLSearchParams | Record<string, string | string[] | undefined>): Promise<SupportedLocale> {
  const fromQuery =
    searchParams instanceof URLSearchParams
      ? searchParams.get('locale')
      : typeof searchParams?.locale === 'string'
        ? searchParams.locale
        : Array.isArray(searchParams?.locale)
          ? searchParams?.locale[0]
          : undefined

  if (fromQuery) return resolveLocaleFromInput(fromQuery)

  const cookieStore = await cookies()
  const fromCookie = cookieStore.get('rc_locale')?.value
  if (fromCookie) return resolveLocaleFromInput(fromCookie)

  const headerStore = await headers()
  return resolveLocaleFromInput(headerStore.get('accept-language'))
}

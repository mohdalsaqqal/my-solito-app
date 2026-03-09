import i18next from 'i18next'
import { defaultLocale, namespaces, type AppLocale } from './config'
import { resources } from './resources-loader'
import { resolveDirection } from '../rtl-manager'
import type { TranslationKey } from './generated/translation-keys'

let initialized = false

export async function initI18n(locale: AppLocale = defaultLocale) {
  if (!initialized) {
    if (typeof window !== 'undefined') {
      const { initReactI18next } = await import('react-i18next')
      i18next.use(initReactI18next)
    }

    await i18next.init({
      lng: locale,
      fallbackLng: defaultLocale,
      supportedLngs: ['en', 'ar'],
      ns: [...namespaces],
      defaultNS: 'common',
      interpolation: {
        escapeValue: false,
      },
      resources,
      returnNull: false,
      returnEmptyString: false,
    })
    initialized = true
    return i18next
  }

  if (i18next.language !== locale) {
    await i18next.changeLanguage(locale)
  }

  return i18next
}

export async function changeLocale(locale: AppLocale) {
  await initI18n(locale)
}

export function getI18n() {
  return i18next
}

export function getCurrentDirection() {
  return resolveDirection(i18next.language as AppLocale)
}

export function t(key: TranslationKey, options?: Record<string, unknown>) {
  return i18next.t(key, options)
}

export type { AppLocale, TranslationKey }

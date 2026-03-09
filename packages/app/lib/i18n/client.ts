'use client'

import { initI18n } from './index'
import { getCurrentLocale, setCurrentLocale, useCurrentLocale } from './locale-store'
import type { AppLocale } from './config'

export async function changeLocale(locale: AppLocale) {
  setCurrentLocale(locale)
  await initI18n(locale)
}

export { initI18n }
export { getCurrentLocale, setCurrentLocale, useCurrentLocale }
export type { AppLocale }

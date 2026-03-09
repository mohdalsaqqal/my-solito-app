import { ProviderResult } from './types'

export type TranslationLocale = 'en' | 'ar'

export type TranslationNamespaceStatus = {
  namespace: string
  totalKeys: number
  missingKeys: number
}

export type TranslationLocaleStatus = {
  locale: TranslationLocale
  totalKeys: number
  missingKeys: number
  namespaces: TranslationNamespaceStatus[]
}

export type TranslationStatus = {
  provider: 'crowdin'
  connected: boolean
  checkedAt: string
  locales: TranslationLocaleStatus[]
}

export type PrefillResult = {
  provider: 'crowdin'
  runAt: string
  sourceLocale: TranslationLocale
  targetLocale: TranslationLocale
  filledKeys: number
  missingBefore: number
  missingAfter: number
  dryRun: boolean
}

export interface TranslationProvider {
  prefillMissingKeys(input?: { dryRun?: boolean }): Promise<ProviderResult<PrefillResult>>
  getStatus(): Promise<ProviderResult<TranslationStatus>>
}

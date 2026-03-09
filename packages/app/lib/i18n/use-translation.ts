import { useMemo } from 'react'
import { useTranslation as useReactI18nextTranslation } from 'react-i18next'
import type { AppNamespace } from './config'
import type { TranslationKey } from './generated/translation-keys'

export function useTranslation(namespace: AppNamespace = 'common') {
  const api = useReactI18nextTranslation(namespace)

  return useMemo(
    () => ({
      ...api,
      t: (key: TranslationKey, options?: Record<string, unknown>) => api.t(key, options),
    }),
    [api]
  )
}

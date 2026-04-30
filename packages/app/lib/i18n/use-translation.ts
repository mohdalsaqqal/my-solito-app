import { useEffect, useMemo, useState } from 'react'
import type { AppNamespace } from './config'
import { getI18n, initI18n } from './index'
import { useCurrentLocale } from './locale-store'

export function useTranslation(namespace: AppNamespace | string = 'common') {
  const locale = useCurrentLocale()
  const [ready, setReady] = useState(() => getI18n().isInitialized)

  useEffect(() => {
    let active = true
    initI18n(locale).then(() => {
      if (active) setReady(true)
    })
    return () => {
      active = false
    }
  }, [locale])

  return useMemo(
    () => ({
      i18n: getI18n(),
      ready,
      t: (key: string, options?: Record<string, unknown>) =>
        ready
          ? (getI18n().t as (key: string, options?: Record<string, unknown>) => string)(key, {
              ns: namespace,
              ...options,
            })
          : key,
    }),
    [namespace, ready]
  )
}

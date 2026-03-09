import { I18nManager } from 'react-native'
import {
  isRtlLocale,
  resolveDirection,
  resolveLocale,
  resolveLocaleAndDirectionFromAcceptLanguage,
  resolveLocaleFromAcceptLanguage,
} from './rtl-manager'

export {
  isRtlLocale,
  resolveDirection,
  resolveLocale,
  resolveLocaleAndDirectionFromAcceptLanguage,
  resolveLocaleFromAcceptLanguage,
}

export function syncNativeRtlDirection(input?: string | null) {
  const nextIsRTL = resolveDirection(input) === 'rtl'
  const requiresReload = I18nManager.isRTL !== nextIsRTL
  I18nManager.allowRTL(nextIsRTL)
  I18nManager.forceRTL(nextIsRTL)
  return {
    isRTL: nextIsRTL,
    requiresReload,
  }
}

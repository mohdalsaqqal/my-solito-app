import { resolveDirection } from './rtl-manager-core'

export type { LayoutDirection, SupportedLocale } from './rtl-manager-core'
export {
  isRtlLocale,
  resolveDirection,
  resolveLocale,
  resolveLocaleAndDirectionFromAcceptLanguage,
  resolveLocaleFromAcceptLanguage,
} from './rtl-manager-core'

// Web/shared fallback; native implementation overrides this in rtl-manager.native.ts.
export function syncNativeRtlDirection(input?: string | null) {
  const isRTL = resolveDirection(input) === 'rtl'
  return {
    isRTL,
    requiresReload: false,
  }
}

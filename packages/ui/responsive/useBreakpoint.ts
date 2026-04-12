import { useSyncExternalStore } from 'react'
import { I18nManager, Platform, useWindowDimensions } from 'react-native'
import { buildLayoutProfile, type LayoutProfile } from './profiles'

function subscribeToViewport(onStoreChange: () => void) {
  if (Platform.OS !== 'web') {
    return () => undefined
  }

  globalThis.addEventListener?.('resize', onStoreChange)
  globalThis.visualViewport?.addEventListener?.('resize', onStoreChange)

  return () => {
    globalThis.removeEventListener?.('resize', onStoreChange)
    globalThis.visualViewport?.removeEventListener?.('resize', onStoreChange)
  }
}

function getViewportSnapshot() {
  if (Platform.OS !== 'web') {
    return 0
  }

  return Math.round(
    globalThis.innerWidth ??
      globalThis.document?.documentElement?.clientWidth ??
      globalThis.visualViewport?.width ??
      0
  )
}

/**
 * The single source of truth for width-driven layout in the storefront stack.
 *
 * SSR strategy:
 * - Web server snapshot: width=0 -> mobile baseline
 * - Web client snapshot: live viewport width from the browser
 * - Native: RN dimensions
 */
export function useBreakpoint(): LayoutProfile {
  const { width } = useWindowDimensions()
  const isRTL = I18nManager.isRTL
  const webWidth = useSyncExternalStore(subscribeToViewport, getViewportSnapshot, () => 0)
  const effectiveWidth = Platform.OS === 'web' ? webWidth : width

  return buildLayoutProfile(effectiveWidth, isRTL)
}

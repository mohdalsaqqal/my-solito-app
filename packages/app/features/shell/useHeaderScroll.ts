// packages/app/features/shell/useHeaderScroll.ts
import { Platform } from 'react-native'
import { useEffect, useState } from 'react'
import { subscribeNativeScrollOffset } from '@real/ui'

type UseHeaderScrollReturn =
  | { isAtTop: boolean } // web
  | { isAtTop: boolean } // native

export function useHeaderScroll(): UseHeaderScrollReturn {
  const isWeb = Platform.OS === 'web'

  // Keep SSR and the first client render deterministic, then sync with real scroll after mount.
  const [isAtTop, setIsAtTop] = useState<boolean>(true)

  useEffect(() => {
    if (isWeb) return

    return subscribeNativeScrollOffset((offsetY) => {
      setIsAtTop(offsetY === 0)
    })
  }, [isWeb])

  useEffect(() => {
    if (!isWeb) return

    let ticking = false

    const onScroll = () => {
      if (!ticking) {
        globalThis.requestAnimationFrame?.(() => {
          const scrollY = (globalThis as { scrollY?: number }).scrollY ?? 0
          setIsAtTop(scrollY === 0)
          ticking = false
        })
        ticking = true
      }
    }

    // Run once immediately to sync state with current scroll position
    onScroll()
    globalThis.addEventListener?.('scroll', onScroll, { passive: true })
    return () => globalThis.removeEventListener?.('scroll', onScroll)
  }, [isWeb])

  return { isAtTop }
}

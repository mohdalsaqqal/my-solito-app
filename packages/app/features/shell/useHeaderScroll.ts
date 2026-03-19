// packages/app/features/shell/useHeaderScroll.ts
import { Platform } from 'react-native'
import { useEffect, useState, useCallback } from 'react'

type UseHeaderScrollReturn =
  | { isAtTop: boolean; onScroll?: undefined }         // web
  | { isAtTop: boolean; onScroll: (e: any) => void }  // native

export function useHeaderScroll(): UseHeaderScrollReturn {
  const isWeb = Platform.OS === 'web'

  const [isAtTop, setIsAtTop] = useState<boolean>(() => {
    if (!isWeb) return true
    if (typeof globalThis.scrollY === 'undefined') return true
    return (globalThis as { scrollY?: number }).scrollY === 0
  })

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

  const onScroll = useCallback((e: any) => {
    const y: number = e?.nativeEvent?.contentOffset?.y ?? 0
    setIsAtTop(y === 0)
  }, [])

  if (isWeb) {
    return { isAtTop }
  }

  return { isAtTop, onScroll }
}

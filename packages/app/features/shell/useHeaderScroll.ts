import { useEffect, useState } from 'react'

type UseHeaderScrollReturn = { isAtTop: boolean }

export function useHeaderScroll(): UseHeaderScrollReturn {
  const [isAtTop, setIsAtTop] = useState<boolean>(true)

  useEffect(() => {
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

    onScroll()
    globalThis.addEventListener?.('scroll', onScroll, { passive: true })
    return () => globalThis.removeEventListener?.('scroll', onScroll)
  }, [])

  return { isAtTop }
}

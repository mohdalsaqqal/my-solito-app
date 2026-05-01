import { useEffect, useState } from 'react'
import { subscribeNativeScrollOffset } from '@real/ui'

type UseHeaderScrollReturn = { isAtTop: boolean }

export function useHeaderScroll(): UseHeaderScrollReturn {
  const [isAtTop, setIsAtTop] = useState<boolean>(true)

  useEffect(() => {
    return subscribeNativeScrollOffset((offsetY) => {
      setIsAtTop(offsetY === 0)
    })
  }, [])

  return { isAtTop }
}

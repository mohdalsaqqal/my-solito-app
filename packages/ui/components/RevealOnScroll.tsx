import { ReactNode, useEffect, useRef, useState } from 'react'
import { Platform, View, ViewStyle } from 'react-native'
import { motionDuration, motionEasing } from '@real/tokens'

type RevealOnScrollProps = {
  children: ReactNode
  delayMs?: number
  liftY?: number
  style?: ViewStyle
}

export function RevealOnScroll({
  children,
  delayMs = 0,
  liftY = 10,
  style,
}: RevealOnScrollProps) {
  const [visible, setVisible] = useState(Platform.OS !== 'web')
  const ref = useRef<any>(null)

  useEffect(() => {
    if (Platform.OS !== 'web') {
      return
    }

    const target = ref.current as Element | null
    const Observer = (globalThis as any).IntersectionObserver as
      | (new (
          callback: (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => void,
          options?: IntersectionObserverInit
        ) => IntersectionObserver)
      | undefined

    if (!target || !Observer) {
      setVisible(true)
      return
    }

    const observer = new Observer(
      (entries, ob) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true)
            ob.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [])

  return (
    <View
      ref={ref}
      style={[
        {
          opacity: visible ? 1 : 0,
          transform: [{ translateY: visible ? 0 : liftY }],
          transitionProperty: 'opacity, transform',
          transitionDuration: `${motionDuration.pageReveal}ms`,
          transitionTimingFunction: motionEasing.entrance,
          transitionDelay: `${delayMs}ms`,
        } as ViewStyle,
        style,
      ]}
    >
      {children}
    </View>
  )
}


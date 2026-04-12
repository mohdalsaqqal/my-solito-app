"use client"

import { Dispatch, MutableRefObject, SetStateAction, useEffect } from 'react'
import { ScrollView } from 'react-native'

type RailAutoplayParams = {
  enabled?: boolean
  autoplayMs?: number
  railRef: MutableRefObject<ScrollView | null>
  offsetRef: MutableRefObject<number>
  viewportRef: MutableRefObject<number>
  contentRef: MutableRefObject<number>
  stepDistance: number
  itemCount: number
}

type SnapCarouselAutoplayParams = {
  enabled?: boolean
  autoplayMs?: number
  scrollRef: MutableRefObject<ScrollView | null>
  itemCount: number
  stepWidth: number
  setActiveIndex: Dispatch<SetStateAction<number>>
}

export function useRailAutoplay({
  enabled,
  autoplayMs = 4200,
  railRef,
  offsetRef,
  viewportRef,
  contentRef,
  stepDistance,
  itemCount,
}: RailAutoplayParams) {
  useEffect(() => {
    if (!enabled || itemCount <= 1) return

    const timer = setInterval(() => {
      const maxOffset = Math.max(0, contentRef.current - viewportRef.current)
      const next = offsetRef.current + stepDistance
      const target = next > maxOffset ? 0 : next
      railRef.current?.scrollTo({ x: target, animated: target !== 0 })
      offsetRef.current = target
    }, autoplayMs)

    return () => clearInterval(timer)
  }, [autoplayMs, contentRef, enabled, itemCount, offsetRef, railRef, stepDistance, viewportRef])
}

export function useSnapCarouselAutoplay({
  enabled,
  autoplayMs = 4200,
  scrollRef,
  itemCount,
  stepWidth,
  setActiveIndex,
}: SnapCarouselAutoplayParams) {
  useEffect(() => {
    if (!enabled || itemCount <= 1) return

    const timer = setInterval(() => {
      setActiveIndex((current) => {
        const next = (current + 1) % itemCount
        scrollRef.current?.scrollTo({
          x: next * stepWidth,
          animated: true,
        })
        return next
      })
    }, autoplayMs)

    return () => clearInterval(timer)
  }, [autoplayMs, enabled, itemCount, scrollRef, setActiveIndex, stepWidth])
}

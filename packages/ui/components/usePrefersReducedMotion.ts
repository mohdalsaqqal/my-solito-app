'use client'

import { useEffect, useState } from 'react'
import { AccessibilityInfo, Platform } from 'react-native'

export function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    if (Platform.OS === 'web') {
      if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
        return
      }

      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      const updatePreference = (matches: boolean) => setPrefersReducedMotion(matches)
      updatePreference(mediaQuery.matches)

      const handleChange = (event: { matches: boolean }) => updatePreference(event.matches)

      if (typeof mediaQuery.addEventListener === 'function') {
        mediaQuery.addEventListener('change', handleChange)
        return () => mediaQuery.removeEventListener('change', handleChange)
      }

      mediaQuery.addListener(handleChange)
      return () => mediaQuery.removeListener(handleChange)
    }

    let active = true

    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (active) {
          setPrefersReducedMotion(enabled)
        }
      })
      .catch(() => {})

    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
      setPrefersReducedMotion(enabled)
    })

    return () => {
      active = false
      subscription.remove()
    }
  }, [])

  return prefersReducedMotion
}

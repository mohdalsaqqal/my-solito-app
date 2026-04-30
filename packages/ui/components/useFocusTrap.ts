import { useEffect } from 'react'
import { Platform } from 'react-native'

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

export function useFocusTrap(ref: React.RefObject<HTMLElement | null>, open: boolean) {
  useEffect(() => {
    if (Platform.OS !== 'web' || !open || !ref.current) {
      return
    }

    const container = ref.current
    const previouslyFocused = document.activeElement as HTMLElement | null

    const getFocusableElements = () => {
      const elements = container.querySelectorAll(FOCUSABLE_SELECTORS)
      return Array.from(elements) as HTMLElement[]
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return

      const focusable = getFocusableElements()
      if (focusable.length === 0) return

      const firstFocusable = focusable[0]
      const lastFocusable = focusable[focusable.length - 1]
      if (!firstFocusable || !lastFocusable) return

      if (event.shiftKey) {
        if (document.activeElement === firstFocusable) {
          event.preventDefault()
          lastFocusable.focus()
        }
      } else {
        if (document.activeElement === lastFocusable) {
          event.preventDefault()
          firstFocusable.focus()
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown)

    return () => {
      container.removeEventListener('keydown', handleKeyDown)
      previouslyFocused?.focus()
    }
  }, [ref, open])
}

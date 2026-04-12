import { useCallback, useRef, useState } from 'react'
import { Platform } from 'react-native'

type RovingProps = {
  tabIndex: number
  onKeyDown: (e: React.KeyboardEvent) => void
  ref: (el: HTMLElement | null) => void
}

type UseRovingTabIndexOptions = {
  itemCount: number
  orientation?: 'horizontal' | 'vertical'
  onFocusChange?: (index: number) => void
}

const inertProps: RovingProps = {
  tabIndex: -1,
  onKeyDown: () => {},
  ref: () => {},
}

export function useRovingTabIndex({
  itemCount,
  orientation = 'horizontal',
  onFocusChange,
}: UseRovingTabIndexOptions): (index: number) => RovingProps {
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const elementsRef = useRef<(HTMLElement | null)[]>([])

  const getRovingProps = useCallback(
    (index: number): RovingProps => {
      if (Platform.OS !== 'web') return inertProps

      const isFocused = index === focusedIndex
      const nextKey = orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown'
      const prevKey = orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp'

      const handleKeyDown = (e: React.KeyboardEvent) => {
        let nextIndex: number | null = null

        if (e.key === nextKey) {
          e.preventDefault()
          nextIndex = focusedIndex < 0 ? 0 : Math.min(focusedIndex + 1, itemCount - 1)
        } else if (e.key === prevKey) {
          e.preventDefault()
          nextIndex = focusedIndex < 0 ? 0 : Math.max(focusedIndex - 1, 0)
        } else if (e.key === 'Home') {
          e.preventDefault()
          nextIndex = 0
        } else if (e.key === 'End') {
          e.preventDefault()
          nextIndex = itemCount - 1
        }

        if (nextIndex !== null && nextIndex !== focusedIndex) {
          setFocusedIndex(nextIndex)
          onFocusChange?.(nextIndex)
          requestAnimationFrame(() => {
            elementsRef.current[nextIndex]?.focus()
          })
        }
      }

      const handleRef = (el: HTMLElement | null) => {
        elementsRef.current[index] = el
      }

      return {
        tabIndex: isFocused ? 0 : -1,
        onKeyDown: handleKeyDown,
        ref: handleRef,
      }
    },
    [focusedIndex, itemCount, orientation, onFocusChange],
  )

  return getRovingProps
}

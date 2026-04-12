import { Platform } from 'react-native'

type NativeScrollListener = (offsetY: number) => void

const listeners = new Set<NativeScrollListener>()
let latestOffsetY = 0

function normalizeOffsetY(value: unknown): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 0
  }
  return Math.max(0, value)
}

export function emitNativeScrollOffset(offsetY: number) {
  if (Platform.OS === 'web') {
    return
  }

  latestOffsetY = normalizeOffsetY(offsetY)
  listeners.forEach((listener) => listener(latestOffsetY))
}

export function subscribeNativeScrollOffset(listener: NativeScrollListener) {
  listeners.add(listener)
  listener(latestOffsetY)
  return () => {
    listeners.delete(listener)
  }
}

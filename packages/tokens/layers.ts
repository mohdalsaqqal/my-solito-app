import { zIndex as tokenZIndex } from './zIndex'
import { opacity as tokenOpacity } from './opacity'

export const zIndex = tokenZIndex
export const opacity = tokenOpacity

export const layers = {
  zIndex,
  opacity,
} as const

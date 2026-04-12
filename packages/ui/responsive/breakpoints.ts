import { breakpoints } from '@real/tokens'

export type Breakpoint = 'mobile' | 'tablet' | 'desktop'

/**
 * Resolves a measured pixel width to a named breakpoint.
 * Width 0 always returns 'mobile' — used as the SSR baseline.
 */
export function resolveBreakpoint(width: number): Breakpoint {
  if (width === 0 || width <= breakpoints.mobileMax) return 'mobile'
  if (width <= breakpoints.tabletMax) return 'tablet'
  return 'desktop'
}

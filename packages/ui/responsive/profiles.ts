import { breakpoints, componentTokens, grid, layout } from '@real/tokens'
import { resolveBreakpoint, type Breakpoint } from './breakpoints'

export type LayoutProfile = {
  /** Named breakpoint derived from measured width */
  breakpoint: Breakpoint
  /** Actual measured container width in px (0 = SSR baseline) */
  containerWidth: number
  /** Number of product grid columns */
  columns: number
  /** Horizontal gutter / padding in px */
  gutterX: number
  /** Vertical section spacing in px */
  sectionY: number
  /** Hero display mode */
  heroMode: 'scroll' | 'tiles'
  /** Product rail display mode */
  railMode: 'scroll' | 'grid'
  /** Resolved hero card width in px */
  cardWidth: number
  /** Resolved hero card height in px */
  cardHeight: number
  /** Whether hover interactions are enabled (desktop web only) */
  hoverEnabled: boolean
  /** Whether layout is right-to-left */
  isRTL: boolean
}

const heroTokens = componentTokens.storefrontHome.hero

function resolveCardWidth(breakpoint: Breakpoint, containerWidth: number, gutterX: number): number {
  const effectiveWidth = containerWidth || layout.containerMaxWidth
  if (breakpoint === 'desktop') {
    const visibleCards = heroTokens.desktopVisibleCards ?? 2.2
    const railGap = heroTokens.railGap ?? 16
    return Math.round(
      (Math.max(280, effectiveWidth - gutterX * 2) - railGap * (Math.ceil(visibleCards) - 1)) /
        visibleCards,
    )
  }
  // mobile / tablet: near full-width scroll card
  return Math.max(292, effectiveWidth - 48)
}

function resolveCardHeight(breakpoint: Breakpoint, containerWidth: number): number {
  if (breakpoint === 'desktop') return heroTokens.desktopCardHeight ?? 520
  if (containerWidth >= breakpoints.tabletMin) return heroTokens.tabletCardHeight ?? 480
  return heroTokens.mobileCardHeight ?? 420
}

/**
 * Pure function — no hooks, fully testable.
 * Derives a complete LayoutProfile from a measured pixel width.
 * Pass width=0 to get the SSR-safe mobile baseline.
 */
export function buildLayoutProfile(width: number, isRTL = false): LayoutProfile {
  const breakpoint = resolveBreakpoint(width)

  const gutterX =
    breakpoint === 'desktop'
      ? layout.gutterX.lg
      : breakpoint === 'tablet'
        ? layout.gutterX.md
        : layout.gutterX.sm

  const sectionY =
    breakpoint === 'desktop'
      ? layout.sectionY.roomy
      : breakpoint === 'tablet'
        ? layout.sectionY.normal
        : layout.sectionY.tight

  const columns =
    breakpoint === 'desktop'
      ? grid.productColumns.desktop
      : breakpoint === 'tablet'
        ? grid.productColumns.tablet
        : grid.productColumns.mobile

  return {
    breakpoint,
    containerWidth: width,
    columns,
    gutterX,
    sectionY,
    heroMode: breakpoint === 'desktop' ? 'tiles' : 'scroll',
    railMode: breakpoint === 'desktop' ? 'grid' : 'scroll',
    cardWidth: resolveCardWidth(breakpoint, width, gutterX),
    cardHeight: resolveCardHeight(breakpoint, width),
    hoverEnabled: breakpoint === 'desktop',
    isRTL,
  }
}

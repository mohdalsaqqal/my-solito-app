// ── Figma 9-level elevation system — React Native shadow properties ───────────
// Source: Figma "System Effect" section — 9 levels, 3-layer each
// React Native supports a single shadow layer (iOS) + elevation (Android).
// We approximate using the dominant/primary layer from the 3-layer Figma spec.
// CSS multi-layer box-shadows are handled in elevation.ts for web.
export const shadows = {
  none: {
    shadowColor: 'hsl(0 0% 0%)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },

  e01: {
    shadowColor: 'hsl(14 12% 12%)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  e02: {
    shadowColor: 'hsl(14 12% 12%)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  e03: {
    shadowColor: 'hsl(14 12% 12%)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  e04: {
    shadowColor: 'hsl(14 12% 12%)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  e05: {
    shadowColor: 'hsl(14 12% 12%)',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },
  e06: {
    shadowColor: 'hsl(14 12% 12%)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.09,
    shadowRadius: 12,
    elevation: 6,
  },
  e08: {
    shadowColor: 'hsl(14 12% 12%)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 14,
    elevation: 8,
  },
  e12: {
    shadowColor: 'hsl(14 12% 12%)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.10,
    shadowRadius: 18,
    elevation: 12,
  },
  e16: {
    shadowColor: 'hsl(14 12% 12%)',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.11,
    shadowRadius: 24,
    elevation: 16,
  },
  e24: {
    shadowColor: 'hsl(14 12% 12%)',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.12,
    shadowRadius: 32,
    elevation: 24,
  },

  // ── Semantic aliases → mapped to Figma levels ─────────────────────────────
  xs: {
    shadowColor: 'hsl(14 12% 12%)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: 'hsl(14 12% 12%)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: 'hsl(14 12% 12%)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },
  lg: {
    shadowColor: 'hsl(14 12% 12%)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.10,
    shadowRadius: 18,
    elevation: 12,
  },
  xl: {
    shadowColor: 'hsl(14 12% 12%)',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
    elevation: 24,
  },
} as const

// ── Web-only CSS box-shadow tokens ────────────────────────────────────────────
// Used for sticky/scroll-aware elements where a multi-layer CSS shadow is needed.
// React Native does not support CSS box-shadow strings; use the `shadows` object above.
export const headerScrollShadow = '0 2px 8px rgba(14,10,10,0.06), 0 4px 18px rgba(14,10,10,0.07)'

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

  // ── Figma Elevation levels (numeric name = Figma dp level) ────────────────
  e01: {
    shadowColor: 'hsl(0 0% 0%)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.20,
    shadowRadius: 1,
    elevation: 1,
  },
  e02: {
    shadowColor: 'hsl(0 0% 0%)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.20,
    shadowRadius: 2,
    elevation: 2,
  },
  e03: {
    shadowColor: 'hsl(0 0% 0%)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.20,
    shadowRadius: 3,
    elevation: 3,
  },
  e04: {
    shadowColor: 'hsl(0 0% 0%)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.20,
    shadowRadius: 4,
    elevation: 4,
  },
  e06: {
    shadowColor: 'hsl(0 0% 0%)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.20,
    shadowRadius: 5,
    elevation: 6,
  },
  // Figma Elevation/08 dominant layer: offset(0,5) blur=5 opacity=20%
  e08: {
    shadowColor: 'hsl(0 0% 0%)',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.20,
    shadowRadius: 5,
    elevation: 8,
  },
  e12: {
    shadowColor: 'hsl(0 0% 0%)',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.20,
    shadowRadius: 8,
    elevation: 12,
  },
  e16: {
    shadowColor: 'hsl(0 0% 0%)',
    shadowOffset: { width: 0, height: 9 },
    shadowOpacity: 0.20,
    shadowRadius: 11,
    elevation: 16,
  },
  e24: {
    shadowColor: 'hsl(0 0% 0%)',
    shadowOffset: { width: 0, height: 11 },
    shadowOpacity: 0.24,
    shadowRadius: 15,
    elevation: 24,
  },

  // ── Semantic aliases → mapped to Figma levels ─────────────────────────────
  xs: {
    shadowColor: 'hsl(0 0% 0%)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.20,
    shadowRadius: 1,
    elevation: 1,
  },
  sm: {
    shadowColor: 'hsl(0 0% 0%)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.20,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: 'hsl(0 0% 0%)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.20,
    shadowRadius: 5,
    elevation: 6,
  },
  lg: {
    shadowColor: 'hsl(0 0% 0%)',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.20,
    shadowRadius: 8,
    elevation: 12,
  },
  xl: {
    shadowColor: 'hsl(0 0% 0%)',
    shadowOffset: { width: 0, height: 11 },
    shadowOpacity: 0.24,
    shadowRadius: 15,
    elevation: 24,
  },
} as const

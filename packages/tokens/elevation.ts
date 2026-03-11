// ── Figma 9-level elevation — CSS multi-layer box-shadows ────────────────────
// Source: Figma "System Effect" — 3 layers per level: opacity 20% + 12% + 14%
// Reference (Elevation/08): offset(0,5) blur=5 op=20%, offset(0,3) blur=14 op=12%, offset(0,8) blur=10 op=14%
export const elevation = {
  none: 'none',

  // Figma Elevation/01
  e01: '0 1px 1px rgba(0,0,0,0.20), 0 1px 3px rgba(0,0,0,0.12), 0 2px 1px rgba(0,0,0,0.14)',
  // Figma Elevation/02
  e02: '0 2px 2px rgba(0,0,0,0.20), 0 1px 5px rgba(0,0,0,0.12), 0 3px 1px rgba(0,0,0,0.14)',
  // Figma Elevation/03
  e03: '0 3px 3px rgba(0,0,0,0.20), 0 2px 7px rgba(0,0,0,0.12), 0 4px 2px rgba(0,0,0,0.14)',
  // Figma Elevation/04
  e04: '0 4px 4px rgba(0,0,0,0.20), 0 2px 10px rgba(0,0,0,0.12), 0 5px 3px rgba(0,0,0,0.14)',
  // Figma Elevation/06
  e06: '0 4px 5px rgba(0,0,0,0.20), 0 3px 12px rgba(0,0,0,0.12), 0 6px 8px rgba(0,0,0,0.14)',
  // Figma Elevation/08 — exact from spec
  e08: '0 5px 5px rgba(0,0,0,0.20), 0 3px 14px rgba(0,0,0,0.12), 0 8px 10px rgba(0,0,0,0.14)',
  // Figma Elevation/12
  e12: '0 7px 8px rgba(0,0,0,0.20), 0 5px 22px rgba(0,0,0,0.12), 0 12px 17px rgba(0,0,0,0.14)',
  // Figma Elevation/16
  e16: '0 9px 11px rgba(0,0,0,0.20), 0 6px 30px rgba(0,0,0,0.12), 0 16px 24px rgba(0,0,0,0.14)',
  // Figma Elevation/24
  e24: '0 11px 15px rgba(0,0,0,0.20), 0 9px 46px rgba(0,0,0,0.12), 0 24px 38px rgba(0,0,0,0.14)',

  // ── Semantic aliases → Figma levels ────────────────────────────────────────
  xs: '0 1px 1px rgba(0,0,0,0.20), 0 1px 3px rgba(0,0,0,0.12), 0 2px 1px rgba(0,0,0,0.14)',
  sm: '0 2px 2px rgba(0,0,0,0.20), 0 1px 5px rgba(0,0,0,0.12), 0 3px 1px rgba(0,0,0,0.14)',
  md: '0 4px 5px rgba(0,0,0,0.20), 0 3px 12px rgba(0,0,0,0.12), 0 6px 8px rgba(0,0,0,0.14)',
  lg: '0 7px 8px rgba(0,0,0,0.20), 0 5px 22px rgba(0,0,0,0.12), 0 12px 17px rgba(0,0,0,0.14)',
  xl: '0 11px 15px rgba(0,0,0,0.20), 0 9px 46px rgba(0,0,0,0.12), 0 24px 38px rgba(0,0,0,0.14)',
} as const

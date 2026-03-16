// ── Figma 9-level elevation — CSS multi-layer box-shadows ────────────────────
// Source: Figma "System Effect" — 3 layers per level: opacity 20% + 12% + 14%
// Reference (Elevation/08): offset(0,5) blur=5 op=20%, offset(0,3) blur=14 op=12%, offset(0,8) blur=10 op=14%
export const elevation = {
  none: 'none',

  e01: '0 1px 2px rgba(15,15,17,0.04), 0 1px 4px rgba(15,15,17,0.06)',
  e02: '0 2px 4px rgba(15,15,17,0.05), 0 4px 10px rgba(15,15,17,0.06)',
  e03: '0 3px 6px rgba(15,15,17,0.06), 0 6px 14px rgba(15,15,17,0.07)',
  e04: '0 4px 8px rgba(15,15,17,0.06), 0 8px 18px rgba(15,15,17,0.08)',
  e05: '0 5px 10px rgba(15,15,17,0.07), 0 10px 20px rgba(15,15,17,0.08)',
  e06: '0 6px 12px rgba(15,15,17,0.07), 0 12px 24px rgba(15,15,17,0.09)',
  e08: '0 8px 16px rgba(15,15,17,0.08), 0 16px 32px rgba(15,15,17,0.10)',
  e12: '0 12px 24px rgba(15,15,17,0.09), 0 20px 40px rgba(15,15,17,0.11)',
  e16: '0 16px 30px rgba(15,15,17,0.10), 0 26px 52px rgba(15,15,17,0.12)',
  e24: '0 20px 40px rgba(15,15,17,0.11), 0 36px 64px rgba(15,15,17,0.14)',

  // ── Semantic aliases → Figma levels ────────────────────────────────────────
  xs: '0 1px 2px rgba(15,15,17,0.04), 0 1px 4px rgba(15,15,17,0.06)',
  sm: '0 2px 4px rgba(15,15,17,0.05), 0 4px 10px rgba(15,15,17,0.06)',
  md: '0 4px 8px rgba(15,15,17,0.06), 0 8px 18px rgba(15,15,17,0.08)',
  lg: '0 8px 24px rgba(15,15,17,0.08), 0 16px 40px rgba(15,15,17,0.10)',
  xl: '0 16px 36px rgba(15,15,17,0.10), 0 28px 56px rgba(15,15,17,0.12)',

  // ── Semantic component tokens ──────────────────────────────────────────────
  drawerPanel: '-8px 0 48px rgba(15,15,17,0.15)',
  drawerFooter: '0 -4px 24px rgba(15,15,17,0.04)',
} as const

export const colors = {
  // ── Base surfaces — storefront phase 1 neutral marketplace scale ─────────
  background: 'hsl(0 0% 100%)',
  backgroundSecondary: 'hsl(0 0% 96%)',
  surface: 'hsl(0 0% 100%)',
  surfaceMuted: 'hsl(210 20% 98%)',

  // ── Grayscale — shades of #f8f8f8 (pure neutral) ─────────────────────────
  gray0:  'hsl(0 0% 97%)',   // #f8f8f8 — base
  gray5:  'hsl(0 0% 87%)',   // #dfdfdf — shade 1
  gray10: 'hsl(0 0% 78%)',   // #c6c6c6 — shade 2
  gray20: 'hsl(0 0% 68%)',   // #adadad — shade 3
  gray30: 'hsl(0 0% 58%)',   // #949494 — shade 4
  gray40: 'hsl(0 0% 49%)',   // #7c7c7c — shade 5
  gray50: 'hsl(0 0% 39%)',   // #636363 — shade 6
  gray60: 'hsl(0 0% 29%)',   // #4a4a4a — shade 7
  gray70: 'hsl(0 0% 19%)',   // #313131 — shade 8
  gray80: 'hsl(0 0% 9%)',    // #181818 — shade 9
  gray90: 'hsl(0 0% 0%)',    // #000000 — shade 10
  gray100: 'hsl(0 0% 0%)',   // #000000

  // ── Tints of #f8f8f8 (near-white steps toward #ffffff) ────────────────────
  tint0:  'hsl(0 0% 97%)',   // #f8f8f8 — base
  tint10: 'hsl(0 0% 98%)',   // #f9f9f9 / #fafafa
  tint20: 'hsl(0 0% 98%)',   // #fafafa
  tint30: 'hsl(0 0% 98%)',   // #fbfbfb
  tint40: 'hsl(0 0% 99%)',   // #fcfcfc
  tint50: 'hsl(0 0% 99%)',   // #fdfdfd
  tint60: 'hsl(0 0% 100%)',  // #fefefe / #ffffff
  tint70: 'hsl(0 0% 100%)',  // #ffffff — white

  // ── Ink family — The Atelier prestige dark surfaces ───────────────────────
  // Updated to Figma Primary #1e1e1e and cool dark steps
  inkBlack: 'hsl(0 0% 12%)',
  inkDeep: 'hsl(0 0% 16%)',
  inkMid: 'hsl(0 0% 22%)',
  inkFrost: 'hsl(210 20% 95%)',

  // ── Gold family — Figma Attention #fac300 ─────────────────────────────────
  goldPrimary: 'hsl(42 86% 48%)',
  goldLight: 'hsl(42 88% 61%)',
  goldSubtle: 'hsl(42 70% 93%)',
  premiumBlue: 'hsl(216 100% 49%)',  // Figma Primary home 2 #0064FA
  premiumMist: 'hsl(210 20% 98%)',
  mint: 'hsl(216 100% 49%)',
  sun: 'hsl(0 100% 98%)',
  popPink: 'hsl(358 74% 50%)',
  popBlush: 'hsl(0 100% 98%)',
  stroke: 'hsla(0 0% 0% / 0.10)',

  // ── Figma named palette anchors ────────────────────────────────────────────
  primaryHome1: 'hsl(0 0% 12%)',    // #1E1E1E
  primaryHome2: 'hsl(216 100% 49%)', // #0064FA
  primaryHome3: 'hsl(11 100% 31%)',  // #9F1D00
  secondaryHome1: 'hsl(47 100% 49%)', // #FAC300
  secondaryHome2: 'hsl(0 0% 12%)',
  secondaryHome3: 'hsl(0 0% 12%)',
  linkPrimary: 'hsl(358 74% 50%)',

  // ── Text ──────────────────────────────────────────────────────────────────
  text: 'hsl(0 0% 12%)',
  textPrimary: 'hsl(0 0% 12%)',
  textSecondary: 'hsl(0 0% 32%)',
  mutedText: 'hsl(0 0% 45%)',
  textMuted: 'hsl(0 0% 45%)',
  textInverted: 'hsl(0 0% 100%)',    // white

  // ── Borders ───────────────────────────────────────────────────────────────
  border: 'hsla(0 0% 0% / 0.10)',
  divider: 'hsla(0 0% 0% / 0.10)',

  // ── Brand — REAL Cosmetics crimson (unchanged — brand identity) ───────────
  primary: 'hsl(0 0% 12%)',
  secondary: 'hsl(358 74% 50%)',     // brandCrimson
  accent: 'hsl(47 100% 49%)',        // Figma gold
  brandPrimary: 'hsl(358 74% 50%)',  // REAL Cosmetics crimson CTA — unchanged
  brandPrimaryHover: 'hsl(358 74% 41%)',
  brandPrimaryPressed: 'hsl(358 74% 35%)',
  brandPrimarySubtle: 'hsl(344 80% 98%)',
  primaryText: 'hsl(0 0% 100%)',

  // ── Legacy aliases — DO NOT REMOVE (backward compat) ─────────────────────
  chipBackground: 'hsl(210 20% 98%)',
  brandTeal: 'hsl(358 74% 50%)',   // legacy name — same as brandPrimary
  brandMint: 'hsl(210 20% 98%)',
  brandGreen: 'hsl(358 74% 44%)',  // legacy name — same as brandPrimaryHover

  // ── Correct-name aliases ──────────────────────────────────────────────────
  brandCrimson: 'hsl(358 74% 50%)',
  brandCrimsonHover: 'hsl(358 74% 44%)',
  surfaceSubtle: 'hsl(0 0% 96%)',

  // ── Status — Figma pixel-perfect values ───────────────────────────────────
  success: 'hsl(153 72% 34%)',
  warning: 'hsl(42 86% 48%)',
  danger: 'hsl(344 85% 55%)',
  error: 'hsl(344 85% 55%)',
  sale: 'hsl(344 85% 55%)',
  info: 'hsl(214 90% 42%)',

  // ── Utility ───────────────────────────────────────────────────────────────
  white: 'hsl(0 0% 100%)',
  black: 'hsl(0 0% 12%)',

  // ── Semantic intent aliases ───────────────────────────────────────────────
  salePrice: 'hsl(344 85% 55%)',
  ctaBackground: 'hsl(358 74% 50%)',  // = brandPrimary — for add-to-cart buttons
  urgencyBadge: 'hsl(344 85% 55%)',
} as const

export const colors = {
  // ── Base surfaces — DESIGN.md "Paper-on-Paper" editorial system ──────────
  background: '#f9f9f9',             // surface — main page bg
  backgroundSecondary: '#f3f3f3',    // surface-container-low
  surface: '#f9f9f9',                // main surface
  surfaceMuted: '#eeeeee',           // surface-container

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

  // ── Purple family — header accent system ──────────────────────────────────
  purpleDark: 'hsl(270 60% 8%)',       // near-black purple — deep background
  purpleDeep: 'hsl(270 55% 14%)',      // dark purple surface
  purpleMid: 'hsl(270 50% 22%)',       // mid purple — borders, hover
  purpleAccent: 'hsl(270 70% 55%)',    // vivid purple — active states, icons
  purpleGlow: 'hsl(270 80% 65%)',      // bright purple — highlights
  purpleFrost: 'hsl(270 30% 92%)',     // near-white with purple tint — text on dark

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
  text: '#1a1a1a',                   // near-black — on-surface
  textPrimary: '#1a1a1a',
  textSecondary: '#5e5e5e',          // DESIGN.md secondary label color
  mutedText: '#9e9e9e',
  textMuted: '#9e9e9e',
  textInverted: '#ffffff',

  // ── Borders ───────────────────────────────────────────────────────────────
  border: 'hsla(0 0% 0% / 0.10)',
  divider: 'hsla(0 0% 0% / 0.10)',

  // ── Brand — REAL Cosmetics — DESIGN.md "Editorial Monolith" ──────────────
  // primary = #a8000d (deep blood red — "bloodline" of the design)
  // primary_container = #d31018 (hover state — gradient partner)
  primary: '#a8000d',
  secondary: 'hsl(0 0% 37%)',        // #5e5e5e — secondary text / ghost borders
  accent: 'hsl(47 100% 49%)',         // gold — kept for promo accents
  brandPrimary: '#a8000d',
  brandPrimaryHover: '#d31018',
  brandPrimaryPressed: '#8a000b',
  brandPrimarySubtle: '#fff5f5',
  primaryText: '#ffffff',

  // ── DESIGN.md surface hierarchy — "Paper-on-Paper" ───────────────────────
  // surface-container-lowest  #ffffff — cards, elevated objects
  // surface-container-low     #f3f3f3 — section separators
  // surface-container         #eeeeee — page backgrounds between sections
  // surface                   #f9f9f9 — main page background
  // surface-dim               #e5e5e5 — overlays, editorial image washes
  surfaceLowest:    '#ffffff',       // cards — innermost layer
  surfaceContainerLow: '#f3f3f3',   // section boundaries (no-line rule)
  surfaceContainer: '#eeeeee',      // mid-layer backgrounds
  surfaceDim:       '#e5e5e5',      // image overlays / editorial reveal

  // ── DESIGN.md ghost border — outline-variant at 15% ──────────────────────
  outlineVariant: '#e7bdb7',         // 15% opacity on use — accessibility ghost

  // ── Legacy aliases — DO NOT REMOVE (backward compat) ─────────────────────
  chipBackground: 'hsl(210 20% 98%)',
  brandTeal: '#a8000d',              // legacy name — remapped to editorial red
  brandMint: 'hsl(210 20% 98%)',
  brandGreen: '#d31018',             // legacy name — remapped to hover red

  // ── Correct-name aliases ──────────────────────────────────────────────────
  brandCrimson: '#a8000d',
  brandCrimsonHover: '#d31018',
  surfaceSubtle: '#f3f3f3',

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
  salePrice: '#a8000d',
  ctaBackground: '#a8000d',
  urgencyBadge: '#a8000d',
} as const

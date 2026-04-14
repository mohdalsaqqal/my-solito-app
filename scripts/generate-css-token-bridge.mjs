import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { colors, colorsDark } from '../packages/tokens/colors.ts'
import { motionDuration, motionEasing } from '../packages/tokens/motion.ts'
import { radius } from '../packages/tokens/radius.ts'
import { shadows } from '../packages/tokens/shadows.ts'
import { spacing } from '../packages/tokens/spacing.ts'
import {
  fontFamilies,
  fontWeights,
  letterSpacing,
  lineHeights,
  typography,
} from '../packages/tokens/typography.ts'
import { zIndex } from '../packages/tokens/zIndex.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')
const outputPath = path.join(repoRoot, 'packages', 'ui', 'generated-token-bridge.css')

const args = new Set(process.argv.slice(2))
const checkOnly = args.has('--check')

const LIGHT_COLOR_ORDER = [
  'background',
  'backgroundSecondary',
  'surfaceLowest',
  'surfaceContainerLow',
  'surfaceContainer',
  'surfaceDim',
  'textPrimary',
  'mutedText',
  'border',
  'outlineVariant',
  'surfaceLowest',
  'surfaceMuted',
  'textSecondary',
  'primary',
  'brandPrimaryHover',
  'brandPrimaryPressed',
  'brandPrimarySubtle',
  'primaryText',
  'secondary',
  'textPrimary',
  'accent',
  'textPrimary',
  'border',
  'primary',
  'surfaceLowest',
  'textPrimary',
  'textPrimary',
  'primaryText',
  'inkBlack',
  'inkDeep',
  'inkMid',
  'inkFrost',
  'goldPrimary',
  'goldLight',
  'goldSubtle',
]

function camelToKebab(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([a-zA-Z])(\d)/g, '$1-$2')
    .replace(/_/g, '-')
    .toLowerCase()
}

function formatPx(value) {
  return value === 0 ? '0px' : `${value}px`
}

function formatRem(value) {
  const rem = value / 16
  const fixed = rem.toFixed(4).replace(/\.?0+$/, '')
  return `${fixed}rem`
}

function formatLineHeight(value) {
  if (typeof value !== 'number') {
    return String(value)
  }

  if (value > 4) {
    return formatRem(value)
  }

  return String(value)
}

function formatLetterSpacing(value) {
  return value === 0 ? '0px' : `${value}px`
}

function applyAlpha(color, opacity) {
  if (color.startsWith('hsl(') && color.endsWith(')')) {
    return `${color.slice(0, -1)} / ${opacity})`
  }

  if (color.startsWith('hsla(') && color.endsWith(')')) {
    return color
  }

  return color
}

function shadowToCss(shadow) {
  const x = formatPx(shadow.shadowOffset.width)
  const y = formatPx(shadow.shadowOffset.height)
  const blur = formatPx(shadow.shadowRadius)
  const color = applyAlpha(shadow.shadowColor, shadow.shadowOpacity)
  return `${x} ${y} ${blur} ${color}`
}

function line(name, value, comment = '') {
  const suffix = comment ? ` /* ${comment} */` : ''
  return `  ${name}: ${value};${suffix}`
}

function section(title, lines) {
  return [`  /* ${title} */`, ...lines, ''].join('\n')
}

function colorVarName(key) {
  const aliases = {
    backgroundSecondary: '--color-background-secondary',
    textPrimary: '--color-foreground',
    textSecondary: '--color-muted-foreground',
    mutedText: '--color-foreground-muted',
    primaryText: '--color-primary-foreground',
    surfaceLowest: '--color-surface-lowest',
    surfaceContainerLow: '--color-surface-container-low',
    surfaceContainer: '--color-surface-container',
    surfaceDim: '--color-surface-dim',
    surfaceMuted: '--color-muted',
    brandPrimaryHover: '--color-primary-hover',
    brandPrimaryPressed: '--color-primary-pressed',
    brandPrimarySubtle: '--color-primary-subtle',
    outlineVariant: '--color-outline-variant',
    goldPrimary: '--color-gold',
    goldLight: '--color-gold-light',
    goldSubtle: '--color-gold-subtle',
    inkBlack: '--color-ink-black',
    inkDeep: '--color-ink-deep',
    inkMid: '--color-ink-mid',
    inkFrost: '--color-ink-frost',
    accent: '--color-accent',
    secondary: '--color-secondary',
    border: '--color-border',
    primary: '--color-primary',
    textInverted: '--color-text-inverted',
  }

  return aliases[key] ?? `--color-${camelToKebab(key)}`
}

function generateColorLines(tokenSet) {
  return Object.entries(tokenSet).map(([key, value]) => line(colorVarName(key), value))
}

function generateLightColorLines() {
  const important = [
    'background',
    'backgroundSecondary',
    'surfaceLowest',
    'surfaceContainerLow',
    'surfaceContainer',
    'surfaceDim',
    'textPrimary',
    'mutedText',
    'border',
    'outlineVariant',
    'surfaceLowest',
    'surfaceMuted',
    'textSecondary',
    'primary',
    'brandPrimaryHover',
    'brandPrimaryPressed',
    'brandPrimarySubtle',
    'primaryText',
    'secondary',
    'textPrimary',
    'accent',
    'textPrimary',
    'border',
    'primary',
  ]

  const emitted = new Set()
  const ordered = []

  for (const key of important) {
    if (!(key in colors) || emitted.has(key)) continue
    ordered.push([key, colors[key]])
    emitted.add(key)
  }

  for (const [key, value] of Object.entries(colors)) {
    if (emitted.has(key)) continue
    ordered.push([key, value])
  }

  return ordered.map(([key, value]) => line(colorVarName(key), value))
}

const PUBLIC_SPACING_VALUES = {
  px: '1px',
  '0-5': '2px',
  '1': formatPx(spacing['1']),
  '2': formatPx(spacing['2']),
  '3': formatPx(spacing['3']),
  '4': formatPx(spacing['4']),
  '5': '20px',
  '6': formatPx(spacing['24']),
  '7': '28px',
  '8': formatPx(spacing['32']),
  '10': formatPx(spacing['40']),
  '12': formatPx(spacing['48']),
  '14': formatPx(spacing['56']),
  '16': formatPx(spacing['64']),
  '20': formatPx(spacing['80']),
  '24': formatPx(spacing['96']),
  '32': formatPx(spacing['128']),
}

const PUBLIC_TEXT_VALUES = {
  h1: formatRem(20),
  h2: formatRem(18),
  h3: formatRem(16),
  h4: formatRem(14),
  h5: formatRem(13),
  h6: formatRem(12),
  body1: formatRem(14),
  body2: formatRem(12),
  caption: formatRem(11),
  overline: formatRem(10),
  button: formatRem(14),
  price: formatRem(16),
  xs: formatRem(11),
  sm: formatRem(12),
  base: formatRem(14),
  lg: formatRem(16),
  xl: formatRem(18),
  '2xl': formatRem(20),
  '3xl': formatRem(20),
  '4xl': formatRem(20),
  campaign: formatRem(18),
  headline: formatRem(18),
  subheadline: formatRem(14),
}

const PUBLIC_LINE_HEIGHT_VALUES = {
  h1: formatRem(28),
  h2: formatRem(26),
  h3: formatRem(24),
  h4: formatRem(20),
  h5: formatRem(18),
  h6: formatRem(18),
  body1: formatRem(22),
  body2: formatRem(18),
  caption: formatRem(16),
}

const PUBLIC_TRACKING_VALUES = {
  h1: '-0.03em',
  h2: '-0.02em',
  campaign: '-0.025em',
  label: '0.12em',
  overline: '0.16em',
}

function generateCss() {
  const spacingLines = [
    ...Object.entries(PUBLIC_SPACING_VALUES).map(([key, value]) =>
      line(`--spacing-${key}`, value)
    ),
    ...Object.entries(spacing)
      .map(([key, value]) => [`--spacing-${camelToKebab(key)}`, formatPx(value)])
      .filter(([name]) => !Object.keys(PUBLIC_SPACING_VALUES).some((key) => name === `--spacing-${key}`))
      .map(([name, value]) => line(name, value)),
  ]

  const radiusLines = Object.entries(radius).map(([key, value]) =>
    line(`--radius-${camelToKebab(key)}`, formatPx(value))
  )

  const fontLines = Object.entries(fontFamilies).map(([key, value]) => {
    if (key === 'arabic') {
      return line('--font-arabic', 'var(--font-tajawal, "Tajawal"), -apple-system, system-ui, sans-serif')
    }
    return line(`--font-${camelToKebab(key)}`, value)
  })

  const fontWeightLines = Object.entries(fontWeights).map(([key, value]) =>
    line(`--font-weight-${camelToKebab(key)}`, value)
  )

  const textLines = [
    ...Object.entries(PUBLIC_TEXT_VALUES).map(([key, value]) =>
      line(`--text-${camelToKebab(key)}`, value)
    ),
    ...Object.entries(typography)
      .map(([key, value]) => [`--text-${camelToKebab(key)}`, formatRem(value)])
      .filter(([name]) => !Object.keys(PUBLIC_TEXT_VALUES).some((key) => name === `--text-${camelToKebab(key)}`))
      .map(([name, value]) => line(name, value)),
  ]

  const lineHeightLines = [
    ...Object.entries(PUBLIC_LINE_HEIGHT_VALUES).map(([key, value]) =>
      line(`--leading-${camelToKebab(key)}`, value)
    ),
    ...Object.entries(lineHeights)
      .map(([key, value]) => [`--leading-${camelToKebab(key)}`, formatLineHeight(value)])
      .filter(([name]) =>
        !Object.keys(PUBLIC_LINE_HEIGHT_VALUES).some((key) => name === `--leading-${camelToKebab(key)}`)
      )
      .map(([name, value]) => line(name, value)),
  ]

  const trackingLines = [
    ...Object.entries(PUBLIC_TRACKING_VALUES).map(([key, value]) =>
      line(`--tracking-${camelToKebab(key)}`, value)
    ),
    ...Object.entries(letterSpacing)
      .map(([key, value]) => [`--tracking-${camelToKebab(key)}`, formatLetterSpacing(value)])
      .filter(([name]) =>
        !Object.keys(PUBLIC_TRACKING_VALUES).some((key) => name === `--tracking-${camelToKebab(key)}`)
      )
      .map(([name, value]) => line(name, value)),
  ]

  const shadowLines = Object.entries(shadows).map(([key, value]) =>
    line(`--shadow-${camelToKebab(key)}`, shadowToCss(value))
  )

  const durationLines = [
    line('--duration-micro', `${motionDuration.micro}ms`),
    line('--duration-hover', `${motionDuration.hover}ms`),
    line('--duration-interactive', `${motionDuration.interactive}ms`),
    line('--duration-reveal', `${motionDuration.reveal}ms`),
    line('--duration-stagger', `${motionDuration.stagger}ms`),
    ...Object.entries(motionDuration)
      .filter(([key]) => !['micro', 'hover', 'interactive', 'reveal', 'stagger'].includes(key))
      .map(([key, value]) => line(`--duration-${camelToKebab(key)}`, `${value}ms`)),
  ]

  const easeLines = [
    line('--ease-premium', motionEasing.standard),
    line('--ease-enter', motionEasing.entrance),
    line('--ease-standard', motionEasing.standard),
    line('--ease-exit', motionEasing.exit),
    ...Object.entries(motionEasing)
      .filter(([key]) => !['standard', 'entrance', 'exit'].includes(key))
      .map(([key, value]) => line(`--ease-${camelToKebab(key)}`, value)),
  ]

  const zIndexLines = [
    line('--z-base', String(zIndex.base)),
    line('--z-sticky', String(zIndex.sticky)),
    line('--z-overlay', String(zIndex.overlay)),
    line('--z-modal', String(zIndex.modal)),
    line('--z-toast', String(zIndex.toast)),
    line('--z-search', String(zIndex.searchTop)),
    ...Object.entries(zIndex).map(([key, value]) =>
      line(`--z-${camelToKebab(key)}`, String(value))
    ),
  ]

  const contents = [
    '/* Auto-generated by scripts/generate-css-token-bridge.mjs. Do not edit by hand. */',
    '',
    '@theme {',
    section('Colors', generateLightColorLines()),
    section('Radius', radiusLines),
    section('Spacing', spacingLines),
    section('Fonts', fontLines),
    section('Font weights', fontWeightLines),
    section('Typography', textLines),
    section('Line heights', lineHeightLines),
    section('Letter spacing', trackingLines),
    section('Shadows', shadowLines),
    section('Motion', [...durationLines, '', ...easeLines].filter(Boolean)),
    section('Z-index', zIndexLines),
    '}',
    '',
    '.dark {',
    ...generateColorLines(colorsDark),
    '}',
    '',
  ]

  return contents.join('\n')
}

const css = generateCss()

if (checkOnly) {
  const existing = await fs.readFile(outputPath, 'utf8').catch(() => null)
  if (existing !== css) {
    console.error(`[tokens] CSS bridge is out of date: ${path.relative(repoRoot, outputPath)}`)
    console.error('[tokens] Run: node scripts/generate-css-token-bridge.mjs')
    process.exit(1)
  }

  console.log(`[tokens] CSS bridge is up to date: ${path.relative(repoRoot, outputPath)}`)
  process.exit(0)
}

await fs.writeFile(outputPath, css, 'utf8')
console.log(`[tokens] Wrote ${path.relative(repoRoot, outputPath)}`)

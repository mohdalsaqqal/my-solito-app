import { ReactNode } from 'react'
import { Platform, TextProps, TextStyle } from 'react-native'
import { colors, fontFamilies, fontWeights, letterSpacing, lineHeights, typography } from '@real/tokens'
import { Text as ReusableText } from '../reusables/text'

// Phase 1 migration shim: preserve the legacy storefront text contract while the
// app is migrated toward RNR-native component contracts. Do not add new variant
// names here unless they map to a committed RNR end-state contract.
type TextVariant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'headline'
  | 'hero'
  | 'banner'
  | 'title'
  | 'subtitle'
  | 'body'
  | 'bodySm'
  | 'caption'
  | 'label'
  | 'overline'
  | 'nav'
  | 'meta'
  | 'footer'
  | 'price'

type UiTextProps = TextProps & {
  children?: ReactNode
  tone?: 'default' | 'muted' | 'primary' | 'inverse' | 'danger' | 'success' | 'warning' | 'info' | 'inkFrost'
  variant?: TextVariant
  size?: keyof typeof typography | number
  weight?: TextStyle['fontWeight']
}

type ResolvedVariantStyle = {
  fontSize: number
  lineHeight: number
  fontWeight: TextStyle['fontWeight']
  letterSpacing: number
}

const baseBodyVariant: ResolvedVariantStyle = {
  fontSize: typography.body,
  lineHeight: Math.round(typography.body * lineHeights.relaxed),
  fontWeight: fontWeights.regular,
  letterSpacing: letterSpacing.normal,
}

const textVariantStyles: Record<TextVariant, ResolvedVariantStyle> = {
  display: {
    fontSize: typography.displayTier,
    lineHeight: lineHeights.h1,
    fontWeight: fontWeights.bold,
    letterSpacing: letterSpacing.h1,
  },
  h1: {
    fontSize: typography.headlineTier,
    lineHeight: lineHeights.h4,
    fontWeight: fontWeights.bold,
    letterSpacing: letterSpacing.headlineTier,
  },
  h2: {
    fontSize: typography.subHeadlineTier,
    lineHeight: Math.round(typography.subHeadlineTier * lineHeights.tight),
    fontWeight: fontWeights.semibold,
    letterSpacing: letterSpacing.normal,
  },
  headline: {
    fontSize: typography.heading7,
    lineHeight: Math.round(typography.heading7 * lineHeights.tight),
    fontWeight: fontWeights.semibold,
    letterSpacing: letterSpacing.headlineTier,
  },
  hero: {
    fontSize: typography.heading10,
    lineHeight: lineHeights.hero,
    fontWeight: fontWeights.bold,
    letterSpacing: letterSpacing.campaignHeading,
  },
  banner: {
    fontSize: typography.heading9,
    lineHeight: lineHeights.h2,
    fontWeight: fontWeights.bold,
    letterSpacing: letterSpacing.h2,
  },
  title: {
    fontSize: typography.lg,
    lineHeight: Math.round(typography.lg * lineHeights.tight),
    fontWeight: fontWeights.semibold,
    letterSpacing: letterSpacing.normal,
  },
  subtitle: {
    fontSize: typography.lg,
    lineHeight: Math.round(typography.lg * lineHeights.normal),
    fontWeight: fontWeights.medium,
    letterSpacing: letterSpacing.normal,
  },
  body: baseBodyVariant,
  bodySm: {
    fontSize: typography.bodySm,
    lineHeight: Math.round(typography.bodySm * lineHeights.relaxed),
    fontWeight: fontWeights.regular,
    letterSpacing: letterSpacing.normal,
  },
  caption: {
    fontSize: typography.caption,
    lineHeight: Math.round(typography.caption * lineHeights.normal),
    fontWeight: fontWeights.regular,
    letterSpacing: letterSpacing.normal,
  },
  label: {
    fontSize: typography.label,
    lineHeight: Math.round(typography.label * lineHeights.normal),
    fontWeight: fontWeights.semibold,
    letterSpacing: letterSpacing.caps,
  },
  overline: {
    fontSize: typography.heading6,
    lineHeight: Math.round(typography.heading6 * lineHeights.relaxed),
    fontWeight: fontWeights.semibold,
    letterSpacing: letterSpacing.overline,
  },
  nav: {
    fontSize: typography.nav,
    lineHeight: Math.round(typography.nav * lineHeights.normal),
    fontWeight: fontWeights.medium,
    letterSpacing: letterSpacing.wide,
  },
  meta: {
    fontSize: typography.meta,
    lineHeight: Math.round(typography.meta * lineHeights.normal),
    fontWeight: fontWeights.regular,
    letterSpacing: letterSpacing.normal,
  },
  footer: {
    fontSize: typography.footer,
    lineHeight: Math.round(typography.footer * lineHeights.normal),
    fontWeight: fontWeights.regular,
    letterSpacing: letterSpacing.normal,
  },
  price: {
    fontSize: typography.price,
    lineHeight: Math.round(typography.price * lineHeights.tight),
    fontWeight: fontWeights.bold,
    letterSpacing: letterSpacing.normal,
  },
}

function toneColor(tone: NonNullable<UiTextProps['tone']>) {
  switch (tone) {
    case 'muted':
      return colors.textMuted
    case 'primary':
      return colors.brandPrimary
    case 'inverse':
      return colors.white
    case 'danger':
      return colors.error
    case 'success':
      return colors.success
    case 'warning':
      return colors.warning
    case 'info':
      return colors.info
    case 'inkFrost':
      return colors.inkFrost
    default:
      return colors.textPrimary
  }
}

export function Text({
  children,
  tone = 'default',
  variant = 'body',
  size,
  weight,
  style,
  ...props
}: UiTextProps) {
  const resolved = textVariantStyles[variant] ?? baseBodyVariant
  const resolvedSize = typeof size === 'number' ? size : size ? typography[size] : resolved.fontSize
  const displayVariants: TextVariant[] = ['display', 'hero', 'banner']
  const headingVariants: TextVariant[] = ['h1', 'h2', 'headline', 'title', 'subtitle']
  const utilityVariants: TextVariant[] = ['label', 'overline', 'meta', 'nav', 'caption']
  const commerceValueVariants: TextVariant[] = ['price']

  const defaultFontFamily = displayVariants.includes(variant)
    ? fontFamilies.display
    : commerceValueVariants.includes(variant)
      ? fontFamilies.heading
      : headingVariants.includes(variant)
      ? fontFamilies.heading
      : utilityVariants.includes(variant)
        ? fontFamilies.secondary
      : fontFamilies.sans
  const fontFamily = defaultFontFamily

  return (
    <ReusableText
      variant='default'
      style={[
        {
          color: toneColor(tone),
          fontFamily,
          fontSize: resolvedSize,
          lineHeight: resolved.lineHeight,
          fontWeight: weight ?? resolved.fontWeight,
          letterSpacing: resolved.letterSpacing,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </ReusableText>
  )
}

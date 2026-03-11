import { ReactNode } from 'react'
import { TextProps, TextStyle } from 'react-native'
import { colors, fontFamilies, fontWeights, letterSpacing, lineHeights, typography } from '@real/tokens'
import { Text as ReusableText } from '../reusables/text'

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
    fontSize: typography.heading8,
    lineHeight: Math.round(typography.heading8 * lineHeights.tight),
    fontWeight: fontWeights.bold,
    letterSpacing: letterSpacing.tight,
  },
  h1: {
    fontSize: typography.xxl,
    lineHeight: Math.round(typography.xxl * lineHeights.tight),
    fontWeight: fontWeights.bold,
    letterSpacing: letterSpacing.tight,
  },
  h2: {
    fontSize: typography.xl,
    lineHeight: Math.round(typography.xl * lineHeights.normal),
    fontWeight: fontWeights.semibold,
    letterSpacing: letterSpacing.normal,
  },
  headline: {
    fontSize: typography.heading7,
    lineHeight: Math.round(typography.heading7 * lineHeights.normal),
    fontWeight: fontWeights.semibold,
    letterSpacing: letterSpacing.normal,
  },
  hero: {
    fontSize: typography.heading10,
    lineHeight: Math.round(typography.heading10 * lineHeights.tight),
    fontWeight: fontWeights.bold,
    letterSpacing: letterSpacing.tight,
  },
  banner: {
    fontSize: typography.heading9,
    lineHeight: Math.round(typography.heading9 * lineHeights.tight),
    fontWeight: fontWeights.bold,
    letterSpacing: letterSpacing.tight,
  },
  title: {
    fontSize: typography.lg,
    lineHeight: Math.round(typography.lg * lineHeights.normal),
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
    fontWeight: fontWeights.medium,
    letterSpacing: letterSpacing.wide,
  },
  overline: {
    fontSize: typography.heading6,
    lineHeight: Math.round(typography.heading6 * lineHeights.normal),
    fontWeight: fontWeights.medium,
    letterSpacing: letterSpacing.caps,
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
    lineHeight: Math.round(typography.price * lineHeights.normal),
    fontWeight: fontWeights.semibold,
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
  const headingVariants: TextVariant[] = ['display', 'h1', 'h2', 'headline', 'hero', 'banner', 'title', 'subtitle', 'overline']
  const fontFamily = headingVariants.includes(variant) ? fontFamilies.heading : fontFamilies.sans

  return (
    <ReusableText
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

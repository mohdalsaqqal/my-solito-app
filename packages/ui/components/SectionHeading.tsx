import { createElement, type ReactNode } from 'react'
import { Platform, View } from 'react-native'
import { sectionHeadingTokens, spacing } from '@real/tokens'
import { Text } from '../primitives/Text'
import { BrandArc } from './chrome/BrandArc'

type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4'

type SectionHeadingProps = {
  eyebrow?: ReactNode
  title: ReactNode
  subtitle?: ReactNode
  action?: ReactNode
  align?: 'left' | 'center'
  decorated?: boolean
  level?: HeadingLevel
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  action,
  align = 'left',
  decorated = false,
  level = 'h2',
}: SectionHeadingProps) {
  const centered = align === 'center'
  // Map heading level to available Text variants
  const variantMap: Record<HeadingLevel, 'h1' | 'h2' | 'headline' | 'title'> = {
    h1: 'h1',
    h2: 'h2',
    h3: 'headline',
    h4: 'title',
  }
  const variant = variantMap[level]

  const Heading = createElement(
    level,
    { style: { margin: 0, padding: 0 } },
    createElement(Text, { variant, style: { textAlign: centered ? 'center' : 'left' } }, title),
  )

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: spacing.md,
      }}
    >
      <View style={{ flex: 1, gap: spacing.xs, alignItems: centered ? 'center' : 'flex-start' }}>
        {eyebrow ? (
          <Text variant='caption' weight='700' tone='muted' style={{ textTransform: 'uppercase' }}>
            {eyebrow}
          </Text>
        ) : null}
        <View style={{ gap: sectionHeadingTokens.titleGapY, alignItems: centered ? 'center' : 'flex-start' }}>
          {Platform.OS === 'web' ? Heading : (
            <Text variant={variant} style={{ textAlign: centered ? 'center' : 'left' }}>
              {title}
            </Text>
          )}
        </View>
        {subtitle ? (
          <Text tone='muted' variant='footer' style={{ textAlign: centered ? 'center' : 'left' }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {action ? <View>{action}</View> : null}
    </View>
  )
}

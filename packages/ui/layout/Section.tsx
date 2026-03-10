import { PropsWithChildren } from 'react'
import { View } from 'react-native'
import { colors } from '@real/tokens'
import { usePageScaffold } from './PageScaffold'

type SectionProps = PropsWithChildren<{
  tone?: 'default' | 'subtle' | 'elevated'
  bleed?: 'none' | 'full'
  y?: 'tight' | 'standard' | 'roomy'
}>

function resolveTone(tone: 'default' | 'subtle' | 'elevated') {
  if (tone === 'subtle') {
    return colors.backgroundSecondary
  }
  if (tone === 'elevated') {
    return colors.surfaceMuted
  }
  return undefined
}

export function Section({ children, tone = 'default', bleed = 'none', y = 'standard' }: SectionProps) {
  const { sectionY, gutterX } = usePageScaffold()

  const padY = y === 'tight' ? sectionY * 0.67 : y === 'roomy' ? sectionY * 1.33 : sectionY

  if (bleed === 'full') {
    return (
      <View
        style={{
          marginStart: -gutterX,
          marginEnd: -gutterX,
          paddingStart: gutterX,
          paddingEnd: gutterX,
          paddingTop: padY,
          paddingBottom: padY,
          backgroundColor: resolveTone(tone),
        }}
      >
        {children}
      </View>
    )
  }

  return (
    <View
      style={{
        paddingTop: padY,
        paddingBottom: padY,
        backgroundColor: resolveTone(tone),
      }}
    >
      {children}
    </View>
  )
}

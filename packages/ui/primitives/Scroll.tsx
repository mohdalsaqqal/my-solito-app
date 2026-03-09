import { PropsWithChildren } from 'react'
import {
  ScrollView,
  ScrollViewProps,
  StyleProp,
  ViewStyle,
} from 'react-native'
import { spacing } from '@real/tokens'

type VerticalScrollProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>
  contentContainerStyle?: StyleProp<ViewStyle>
  bottomPadding?: number
  keyboardShouldPersistTaps?: ScrollViewProps['keyboardShouldPersistTaps']
  showsVerticalScrollIndicator?: boolean
}>

type HorizontalScrollProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>
  contentContainerStyle?: StyleProp<ViewStyle>
  showsHorizontalScrollIndicator?: boolean
}>

export function VerticalScroll({
  children,
  style,
  contentContainerStyle,
  bottomPadding,
  keyboardShouldPersistTaps = 'handled',
  showsVerticalScrollIndicator = false,
}: VerticalScrollProps) {
  return (
    <ScrollView
      style={style}
      contentContainerStyle={[
        bottomPadding !== undefined ? { paddingBottom: bottomPadding } : null,
        contentContainerStyle,
      ]}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
    >
      {children}
    </ScrollView>
  )
}

export function HorizontalScroll({
  children,
  style,
  contentContainerStyle,
  showsHorizontalScrollIndicator = false,
}: HorizontalScrollProps) {
  return (
    <ScrollView
      horizontal
      style={style}
      contentContainerStyle={contentContainerStyle}
      showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
    >
      {children}
    </ScrollView>
  )
}

export const DEFAULT_SCREEN_BOTTOM_PADDING = spacing['96']

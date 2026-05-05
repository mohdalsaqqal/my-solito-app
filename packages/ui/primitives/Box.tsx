import { forwardRef, ReactNode } from 'react'
import { View, ViewProps, ViewStyle } from 'react-native'
import { colors, spacing } from '@real/tokens'

type SpaceValue = keyof typeof spacing | number
const NativeView = View as unknown as React.ComponentType<any>

type BoxProps = Omit<ViewProps, 'accessibilityRole'> & {
  children?: ReactNode
  style?: any
  accessibilityRole?: ViewProps['accessibilityRole'] | 'dialog'
  onClick?: (event: any) => void
  tabIndex?: number
  'aria-modal'?: boolean
  flex?: number
  bg?: keyof typeof colors
  gap?: SpaceValue
  p?: SpaceValue
  px?: SpaceValue
  py?: SpaceValue
  pt?: SpaceValue
  pb?: SpaceValue
  ps?: SpaceValue
  pe?: SpaceValue
  justify?: ViewStyle['justifyContent']
  align?: ViewStyle['alignItems']
}

function resolveSpace(value?: SpaceValue) {
  if (typeof value === 'number') {
    return value
  }

  return value ? spacing[value] : undefined
}

export const Box = forwardRef<View, BoxProps>(function Box({
  children,
  style,
  flex,
  bg,
  gap,
  p,
  px,
  py,
  pt,
  pb,
  ps,
  pe,
  justify,
  align,
  ...props
}, ref) {
  return (
    <NativeView
      ref={ref}
      style={[
        {
          flex,
          backgroundColor: bg ? colors[bg] : undefined,
          gap: resolveSpace(gap),
          padding: resolveSpace(p),
          paddingHorizontal: resolveSpace(px),
          paddingVertical: resolveSpace(py),
          paddingTop: resolveSpace(pt),
          paddingBottom: resolveSpace(pb),
          paddingStart: resolveSpace(ps),
          paddingEnd: resolveSpace(pe),
          justifyContent: justify,
          alignItems: align,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </NativeView>
  )
})

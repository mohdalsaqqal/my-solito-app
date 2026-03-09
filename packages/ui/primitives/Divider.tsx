import { View, ViewProps } from 'react-native'
import { borderWidth, colors, spacing } from '@real/tokens'

type DividerProps = ViewProps & {
  tone?: 'default' | 'muted'
  orientation?: 'horizontal' | 'vertical'
  inset?: keyof typeof spacing | number
}

function resolveInset(value?: keyof typeof spacing | number) {
  if (typeof value === 'number') {
    return value
  }
  return value ? spacing[value] : 0
}

export function Divider({
  tone = 'default',
  orientation = 'horizontal',
  inset = 0,
  style,
  ...props
}: DividerProps) {
  const insetValue = resolveInset(inset)
  const color = tone === 'muted' ? colors.border : colors.divider

  return (
    <View
      style={[
        orientation === 'horizontal'
          ? {
              height: borderWidth.thin,
              backgroundColor: color,
              marginHorizontal: insetValue,
            }
          : {
              width: borderWidth.thin,
              backgroundColor: color,
              marginVertical: insetValue,
              alignSelf: 'stretch',
            },
        style,
      ]}
      {...props}
    />
  )
}

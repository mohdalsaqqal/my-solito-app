'use client'

import { Text as RNText, View } from 'react-native'

/**
 * Native: View/Text with className for Uniwind (Metro transforms these).
 */
export function Box({
  className,
  style,
  ...props
}: React.ComponentProps<typeof View> & { className?: string }) {
  return <View className={className} style={style} {...props} />
}

export function Text({
  className,
  style,
  ...props
}: React.ComponentProps<typeof RNText> & { className?: string }) {
  return <RNText className={className} style={style} {...props} />
}

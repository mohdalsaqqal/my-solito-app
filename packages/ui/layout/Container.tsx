import { ReactNode } from 'react'
import { View } from 'react-native'
import { layout } from '@real/tokens'

export type LayoutContainerVariant = 'editorial' | 'commerce' | 'product' | 'cart' | 'checkout' | 'account' | 'dashboard'

type ContainerProps = {
  children?: ReactNode
  variant?: LayoutContainerVariant
  gutter?: 'sm' | 'md' | 'lg'
  centered?: boolean
}

const maxWidthByVariant: Record<LayoutContainerVariant, number> = {
  editorial: layout.maxWidth.editorial,
  commerce: layout.maxWidth.commerce,
  product: layout.maxWidth.product,
  cart: layout.maxWidth.cart,
  checkout: layout.maxWidth.checkout,
  account: layout.maxWidth.account,
  dashboard: layout.maxWidth.dashboard,
}

const gutterBySize = {
  sm: layout.gutterX.sm,
  md: layout.gutterX.md,
  lg: layout.gutterX.lg,
} as const

export function Container({
  children,
  variant = 'editorial',
  gutter = 'md',
  centered = true,
}: ContainerProps) {
  return (
    <View
      style={{
        width: '100%',
        maxWidth: centered ? maxWidthByVariant[variant] : undefined,
        alignSelf: centered ? 'center' : 'stretch',
        paddingLeft: gutterBySize[gutter],
        paddingRight: gutterBySize[gutter],
      }}
    >
      {children}
    </View>
  )
}

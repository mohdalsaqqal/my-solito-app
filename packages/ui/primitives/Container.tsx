import { ReactNode } from 'react'
import { View } from 'react-native'
import { layout } from '@real/tokens'

type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

type ContainerProps = {
  children?: ReactNode
  size?: ContainerSize
  paddingX?: number
}

const maxWidthBySize: Record<ContainerSize, number | undefined> = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: layout.containerMaxWidth,
  full: undefined,
}

export function Container({ children, size = 'xl', paddingX = layout.containerPaddingX }: ContainerProps) {
  return (
    <View
      style={{
        width: '100%',
        maxWidth: maxWidthBySize[size],
        alignSelf: 'center',
        paddingHorizontal: paddingX,
      }}
    >
      {children}
    </View>
  )
}

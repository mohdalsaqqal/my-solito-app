import { ReactNode } from 'react'
import { Modal, View } from 'react-native'
import { borderWidth, colors, opacity, radius, spacing } from '@real/tokens'
import { Touchable } from '../primitives/Touchable'

type DrawerProps = {
  open: boolean
  onClose: () => void
  children?: ReactNode
  maxHeightPercent?: number
}

export function Drawer({ open, onClose, children, maxHeightPercent = 85 }: DrawerProps) {
  return (
    <Modal animationType='slide' transparent visible={open} onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Touchable
          onPress={onClose}
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            start: 0,
            end: 0,
            backgroundColor: `rgba(0,0,0,${opacity.overlayLight})`,
          }}
        />
        <View
          style={{
            backgroundColor: colors.surface,
            padding: spacing.lg,
            borderTopStartRadius: radius.lg,
            borderTopEndRadius: radius.lg,
            maxHeight: `${maxHeightPercent}%`,
            borderTopWidth: borderWidth.thin,
            borderColor: colors.border,
          }}
        >
          {children}
        </View>
      </View>
    </Modal>
  )
}

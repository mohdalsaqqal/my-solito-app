import React, { ReactNode } from 'react'
import { Modal, View } from 'react-native'
import { borderWidth, colors, opacity, radius, spacing } from '@real/tokens'
import { Button as ReusableButton } from '../reusables/button'
import { useThemeColors } from '../responsive'

type DrawerProps = {
  open: boolean
  onClose: () => void
  children?: ReactNode
  maxHeightPercent?: number
}

export const Drawer = React.memo(function Drawer({ open, onClose, children, maxHeightPercent = 85 }: DrawerProps) {
  const c = useThemeColors()
  return (
    <Modal animationType='slide' transparent visible={open} onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <ReusableButton
          onPress={onClose}
          accessibilityLabel='Close drawer'
          variant='ghost'
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            start: 0,
            end: 0,
            backgroundColor: c.black,
            opacity: opacity.overlayLight,
            borderRadius: 0,
          }}
        />
        <View
          style={{
            backgroundColor: c.surface,
            padding: spacing.lg,
            borderTopStartRadius: radius.lg,
            borderTopEndRadius: radius.lg,
            maxHeight: `${maxHeightPercent}%`,
            borderTopWidth: borderWidth.thin,
            borderColor: c.border,
          }}
        >
          {children}
        </View>
      </View>
    </Modal>
  )
})

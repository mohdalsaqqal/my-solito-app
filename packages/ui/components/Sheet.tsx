import { ReactNode } from 'react'
import { Modal, Pressable, View } from 'react-native'
import { radius, spacing, opacity } from '@real/tokens'
import { useThemeColors } from '../responsive'

type SheetProps = {
  visible: boolean
  onClose: () => void
  children?: ReactNode
}

function SheetHandle() {
  const c = useThemeColors()
  return (
    <View
      style={{
        width: 36,
        height: 4,
        borderRadius: radius.full,
        backgroundColor: c.border,
        alignSelf: 'center',
        marginBottom: spacing.md,
      }}
    />
  )
}

function SheetContent({ children }: { children?: ReactNode }) {
  const c = useThemeColors()
  return (
    <View
      style={{
        backgroundColor: c.surface,
        borderTopLeftRadius: radius.lg,
        borderTopRightRadius: radius.lg,
        paddingTop: spacing.sm,
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.xxl,
      }}
    >
      {children}
    </View>
  )
}

function SheetRoot({ visible, onClose, children }: SheetProps) {
  const c = useThemeColors()
  return (
    <Modal
      visible={visible}
      transparent
      animationType='slide'
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Pressable
        onPress={onClose}
        style={{
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: c.black,
  opacity: opacity.medium,
}}
      />
      {/* Slide-up panel */}
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>{children}</View>
    </Modal>
  )
}

export const Sheet = Object.assign(SheetRoot, {
  Handle: SheetHandle,
  Content: SheetContent,
})

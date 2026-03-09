import { ReactNode } from 'react'
import { Modal, Pressable, View } from 'react-native'
import { MotiView } from 'moti'
import { colors, radius, spacing } from '@real/tokens'

type SheetProps = {
  visible: boolean
  onClose: () => void
  children?: ReactNode
}

function SheetHandle() {
  return (
    <View
      style={{
        width: 36,
        height: 4,
        borderRadius: radius.full,
        backgroundColor: colors.border,
        alignSelf: 'center',
        marginBottom: spacing.md,
      }}
    />
  )
}

function SheetContent({ children }: { children?: ReactNode }) {
  return (
    <View
      style={{
        backgroundColor: colors.surface,
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
  return (
    <Modal
      visible={visible}
      transparent
      animationType='none'
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
          backgroundColor: colors.black,
          opacity: 0.5,
        }}
      />
      {/* Slide-up panel */}
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <MotiView
          from={{ translateY: 400 }}
          animate={{ translateY: 0 }}
          transition={{ type: 'timing', duration: 350 }}
        >
          {children}
        </MotiView>
      </View>
    </Modal>
  )
}

export const Sheet = Object.assign(SheetRoot, {
  Handle: SheetHandle,
  Content: SheetContent,
})

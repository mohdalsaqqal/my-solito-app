import { createContext, useCallback, useContext, useRef, useState, ReactNode } from 'react'
import { Pressable, View } from 'react-native'
import { AnimatePresence, MotiView } from 'moti'
import { borderWidth, colors, motionDuration, radius, spacing, zIndex } from '@real/tokens'
import { Text } from '../primitives/Text'

type ToastTone = 'success' | 'error' | 'info' | 'warning'

type ToastItem = {
  id: string
  message: string
  tone: ToastTone
}

type ToastContextValue = {
  show: (message: string, tone?: ToastTone) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const toastAccent: Record<ToastTone, string> = {
  success: colors.success,
  error:   colors.error,
  warning: colors.warning,
  info:    colors.info,
}

function ToastItemView({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 16 }}
      animate={{ opacity: 1, translateY: 0 }}
      exit={{ opacity: 0, translateY: -8 }}
      transition={{ type: 'timing', duration: motionDuration.microInteraction }}
      style={{
        marginBottom: spacing.sm,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radius.md,
        backgroundColor: colors.background,
        borderWidth: borderWidth.thin,
        borderColor: colors.border,
        borderStartWidth: 3,
        borderStartColor: toastAccent[item.tone],
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 8,
      }}
    >
      <Text variant="body" tone="default" style={{ flex: 1 }}>
        {item.message}
      </Text>
      <Pressable
        onPress={onDismiss}
        accessibilityLabel="Dismiss"
        accessibilityRole="button"
      >
        <Text variant="caption" tone="muted">✕</Text>
      </Pressable>
    </MotiView>
  )
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const show = useCallback((message: string, tone: ToastTone = 'info') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, message, tone }])
    timers.current[id] = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
      delete timers.current[id]
    }, 4000)
  }, [])

  const dismiss = useCallback((id: string) => {
    clearTimeout(timers.current[id])
    delete timers.current[id]
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <View
        style={{
          position: 'absolute',
          // RTL: using absolute positioning — acceptable for fixed overlay
          left: spacing.md,
          right: spacing.md,
          bottom: spacing.xl,
          zIndex: zIndex.toast,
          pointerEvents: 'box-none',
        }}
        accessibilityLiveRegion="polite"
      >
        <AnimatePresence>
          {toasts.map((item) => (
            <ToastItemView key={item.id} item={item} onDismiss={() => dismiss(item.id)} />
          ))}
        </AnimatePresence>
      </View>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>')
  return ctx
}

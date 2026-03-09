import { useState } from 'react'
import { Modal, Platform, Pressable, ScrollView, View } from 'react-native'
import { borderWidth, colors, radius, spacing } from '@real/tokens'
import { Text } from '../primitives'
import { Icon } from './Icon'

export type SelectOption = {
  label: string
  value: string
}

type SelectProps = {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
}

export function Select({ value, onChange, options, placeholder = 'Select…' }: SelectProps) {
  const [open, setOpen] = useState(false)
  const selected = options.find((o) => o.value === value)
  const isWeb = Platform.OS === 'web'

  const handleSelect = (optValue: string) => {
    onChange(optValue)
    setOpen(false)
  }

  const OptionList = (
    <View
      style={{
        backgroundColor: colors.surface,
        borderWidth: borderWidth.thin,
        borderColor: colors.border,
        borderRadius: radius.md,
        overflow: 'hidden',
      }}
    >
      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        {options.map((option) => {
          const isSelected = option.value === value
          return (
            <Pressable
              key={option.value}
              onPress={() => handleSelect(option.value)}
              style={{
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                backgroundColor: isSelected ? colors.backgroundSecondary : colors.surface,
              }}
            >
              <Text
                variant='bodySm'
                tone={isSelected ? 'default' : 'muted'}
                weight={isSelected ? '600' : '400'}
              >
                {option.label}
              </Text>
            </Pressable>
          )
        })}
      </ScrollView>
    </View>
  )

  return (
    <View style={{ position: 'relative' }}>
      {/* Trigger */}
      <Pressable
        onPress={() => setOpen((v) => !v)}
        accessibilityRole='button'
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          borderWidth: borderWidth.thin,
          borderColor: open ? colors.textPrimary : colors.border,
          borderRadius: radius.md,
          backgroundColor: colors.surface,
        }}
      >
        <Text
          variant='bodySm'
          tone={selected ? 'default' : 'muted'}
        >
          {selected?.label ?? placeholder}
        </Text>
        <Icon name='more' size={14} color={colors.textMuted} />
      </Pressable>

      {/* Web: inline dropdown */}
      {isWeb && open ? (
        <View
          style={{
            position: 'absolute',
            top: '100%' as any,
            left: 0,
            right: 0,
            zIndex: 100,
            marginTop: spacing.xs,
          }}
        >
          {OptionList}
        </View>
      ) : null}

      {/* Native: modal bottom picker */}
      {!isWeb ? (
        <Modal
          visible={open}
          transparent
          animationType='fade'
          onRequestClose={() => setOpen(false)}
        >
          <Pressable
            style={{
              flex: 1,
              backgroundColor: colors.black,
              opacity: 0.5,
            }}
            onPress={() => setOpen(false)}
          />
          <View
            style={{
              position: 'absolute',
              bottom: spacing.xxl,
              left: spacing.md,
              right: spacing.md,
            }}
          >
            {OptionList}
          </View>
        </Modal>
      ) : null}
    </View>
  )
}

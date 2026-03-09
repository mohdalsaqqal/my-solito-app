import { borderWidth, colors, radius, spacing } from '@real/tokens'
import { Text } from '../primitives/Text'
import { Touchable } from '../primitives/Touchable'

type NavChipProps = {
  label: string
  active?: boolean
  onPress?: () => void
}

export function NavChip({ label, active = false, onPress }: NavChipProps) {
  return (
    <Touchable
      onPress={onPress}
      style={{
        minHeight: 34,
        paddingHorizontal: spacing.md,
        borderRadius: radius.full,
        borderWidth: borderWidth.thin,
        borderColor: active ? colors.textPrimary : colors.border,
        backgroundColor: active ? colors.textPrimary : colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text
        variant='label'
        tone={active ? 'inverse' : 'default'}
        style={{ textTransform: 'uppercase' }}
      >
        {label}
      </Text>
    </Touchable>
  )
}

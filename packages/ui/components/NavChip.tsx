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
        borderColor: active ? colors.brandPrimary : colors.border,
        backgroundColor: active ? colors.brandPrimarySubtle : colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text
        variant='caption'
        weight='700'
        tone={active ? 'primary' : 'default'}
        style={{ textTransform: 'uppercase' }}
      >
        {label}
      </Text>
    </Touchable>
  )
}

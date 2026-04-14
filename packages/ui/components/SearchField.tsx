import { TextInputProps, View } from 'react-native'
import { borderWidth, elevation, inputTokens, spacing } from '@real/tokens'
import { Input } from '../primitives/Input'
import { Icon } from './Icon'
import { useThemeColors } from '../responsive'

type SearchFieldProps = Omit<TextInputProps, 'onChange'> & {
  value: string
  onChange: (value: string) => void
  state?: 'loading' | 'empty' | 'error' | 'disabled' | 'default'
}

export function SearchField({
  value,
  onChange,
  placeholder = 'Search products, brands, ingredients…',
  state = 'default',
  editable = true,
  style,
  ...props
}: SearchFieldProps) {
  const c = useThemeColors()
  const disabled = state === 'disabled' || editable === false
  const invalid = state === 'error'

  return (
    <View style={{ position: 'relative', justifyContent: 'center', width: '100%' }}>
      <View
        style={{
          position: 'absolute',
          pointerEvents: 'none',
          start: spacing.space4,
          zIndex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon
          name='search'
          size={spacing.space4}
          color={invalid ? c.error : c.textSecondary}
        />
      </View>
      <Input
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        accessibilityLabel='Search products'
        autoComplete='off'
        autoCorrect={false}
        spellCheck={false}
        editable={!disabled}
        readOnly={disabled || state === 'loading'}
        invalid={invalid}
        radiusKey='full'
        style={[
          {
            minHeight: inputTokens.height.md,
            paddingLeft: spacing.space12,
            paddingRight: spacing.space4,
            borderRadius: inputTokens.radius.default,
            borderWidth: borderWidth.thin,
            borderColor: invalid ? c.error : c.border,
            backgroundColor: disabled ? c.surfaceMuted : c.surface,
            boxShadow: elevation.xs,
          },
          style,
        ]}
        {...props}
      />
    </View>
  )
}

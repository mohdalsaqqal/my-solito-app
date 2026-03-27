import { TextInputProps, View } from 'react-native'
import { borderWidth, colors, elevation, inputTokens, spacing } from '@real/tokens'
import { Input } from '../primitives/Input'
import { Icon } from './Icon'

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
  const disabled = state === 'disabled' || editable === false
  const invalid = state === 'error'

  return (
    <View style={{ position: 'relative', justifyContent: 'center', width: '100%' }}>
      <View
        pointerEvents='none'
        style={{
          position: 'absolute',
          start: spacing['16'],
          zIndex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon
          name='search'
          size={16}
          color={invalid ? colors.error : colors.textSecondary}
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
            paddingLeft: spacing['48'],
            paddingRight: spacing['16'],
            borderRadius: inputTokens.radius.default,
            borderWidth: borderWidth.thin,
            borderColor: invalid ? colors.error : colors.border,
            backgroundColor: disabled ? colors.backgroundSecondary : colors.surface,
            boxShadow: elevation.e01,
          },
          style,
        ]}
        {...props}
      />
    </View>
  )
}

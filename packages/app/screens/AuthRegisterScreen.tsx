import { useState } from 'react'
import { spacing } from '@real/tokens'
import { PageScaffold, Section } from '@real/ui'
import { Button, Card } from '@real/ui/components'
import { Box, Input, Text } from '@real/ui/primitives'

const authRegisterCopy = {
  title: 'Create Account',
  subtitle: 'Register once and keep your checkout history synced.',
  fullNamePlaceholder: 'Full name',
  emailPlaceholder: 'Email',
  passwordPlaceholder: 'Password',
  goToLogin: 'Already have an account? Sign in',
}

type AuthRegisterScreenProps = {
  loading?: boolean
  error?: string | null
  onSubmit: (input: { name: string; email: string; password: string }) => void | Promise<void>
  onGoToLogin?: () => void
}

export function AuthRegisterScreen({
  loading = false,
  error = null,
  onSubmit,
  onGoToLogin,
}: AuthRegisterScreenProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [validation, setValidation] = useState<string | null>(null)

  const handleSubmit = async () => {
    const normalizedName = name.trim()
    const normalizedEmail = email.trim()

    if (normalizedName.length < 2) {
      setValidation('Please enter your full name.')
      return
    }
    if (!normalizedEmail.includes('@')) {
      setValidation('Please enter a valid email.')
      return
    }
    if (password.length < 6) {
      setValidation('Password must be at least 6 characters.')
      return
    }

    setValidation(null)
    await onSubmit({
      name: normalizedName,
      email: normalizedEmail,
      password,
    })
  }

  return (
    <PageScaffold variant='account' density='standard' scroll='auto'>
      <PageScaffold.Body>
        <Section>
          <Card variant='raised' style={{ gap: spacing.md }}>
            <Text variant='headline'>{authRegisterCopy.title}</Text>
            <Text tone='muted'>{authRegisterCopy.subtitle}</Text>

            <Box style={{ gap: spacing.sm }}>
              <Input
                placeholder={authRegisterCopy.fullNamePlaceholder}
                accessibilityLabel='Full name'
                value={name}
                onChangeText={setName}
                readOnly={loading}
              />
              <Input
                placeholder={authRegisterCopy.emailPlaceholder}
                accessibilityLabel='Email address'
                keyboardType='email-address'
                autoCapitalize='none'
                value={email}
                onChangeText={setEmail}
                readOnly={loading}
              />
              <Input
                placeholder={authRegisterCopy.passwordPlaceholder}
                accessibilityLabel='Password'
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                readOnly={loading}
              />
            </Box>

            {validation ? <Text tone='danger'>{validation}</Text> : null}
            {error ? <Text tone='danger'>{error}</Text> : null}

            <Button onPress={() => void handleSubmit()} disabled={loading}>
              {loading ? 'Creating...' : 'Create Account'}
            </Button>

            <Box style={{ alignSelf: 'flex-start' }}>
              <Button size='sm' variant='ghost' onPress={onGoToLogin}>{authRegisterCopy.goToLogin}</Button>
            </Box>
          </Card>
        </Section>
      </PageScaffold.Body>
    </PageScaffold>
  )
}

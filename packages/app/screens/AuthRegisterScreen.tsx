import { useState } from 'react'
import { spacing } from '@real/tokens'
import { PageScaffold, Section } from '@real/ui'
import { Button, Card } from '@real/ui/components'
import { Box, Input, Text, Touchable } from '@real/ui/primitives'

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
            <Text variant='headline'>Create Account</Text>
            <Text tone='muted'>Register once and keep your checkout history synced.</Text>

            <Box style={{ gap: spacing.sm }}>
              <Input
                placeholder='Full name'
                value={name}
                onChangeText={setName}
                readOnly={loading}
              />
              <Input
                placeholder='Email'
                keyboardType='email-address'
                autoCapitalize='none'
                value={email}
                onChangeText={setEmail}
                readOnly={loading}
              />
              <Input
                placeholder='Password'
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

            <Touchable onPress={onGoToLogin}>
              <Text variant='caption' tone='primary'>Already have an account? Sign in</Text>
            </Touchable>
          </Card>
        </Section>
      </PageScaffold.Body>
    </PageScaffold>
  )
}

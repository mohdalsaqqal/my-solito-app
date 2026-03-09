import { useState } from 'react'
import { spacing } from '@real/tokens'
import { PageScaffold, Section } from '@real/ui'
import { Button, Card } from '@real/ui/components'
import { Box, Input, Text, Touchable } from '@real/ui/primitives'

type AuthLoginScreenProps = {
  loading?: boolean
  error?: string | null
  onSubmit: (input: { email: string; password: string }) => void | Promise<void>
  onGoToRegister?: () => void
  onGoToForgotPassword?: () => void
}

export function AuthLoginScreen({
  loading = false,
  error = null,
  onSubmit,
  onGoToRegister,
  onGoToForgotPassword,
}: AuthLoginScreenProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [validation, setValidation] = useState<string | null>(null)

  const handleSubmit = async () => {
    const normalizedIdentifier = email.trim()
    if (!normalizedIdentifier) {
      setValidation('Please enter your email or username.')
      return
    }
    if (password.length < 4) {
      setValidation('Password must be at least 4 characters.')
      return
    }

    setValidation(null)
    await onSubmit({ email: normalizedIdentifier, password })
  }

  return (
    <PageScaffold variant='account' density='standard' scroll='auto'>
      <PageScaffold.Body>
        <Section>
          <Card variant='raised' style={{ gap: spacing.md }}>
            <Text variant='headline'>Sign In</Text>
            <Text tone='muted'>Continue to your account and orders.</Text>

            <Box style={{ gap: spacing.sm }}>
              <Input
                placeholder='Email or username'
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
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>

            <Box style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Touchable onPress={onGoToForgotPassword}>
                <Text variant='caption' tone='primary'>Forgot password?</Text>
              </Touchable>
              <Touchable onPress={onGoToRegister}>
                <Text variant='caption' tone='primary'>Create account</Text>
              </Touchable>
            </Box>
          </Card>
        </Section>
      </PageScaffold.Body>
    </PageScaffold>
  )
}

import { useState } from 'react'
import { spacing } from '@real/tokens'
import { PageScaffold, Section } from '@real/ui'
import { Button, Card } from '@real/ui/components'
import { Box, Input, Text } from '@real/ui/primitives'

const authForgotCopy = {
  title: 'Reset Password',
  subtitle: 'Enter your email and we will send reset instructions.',
  emailPlaceholder: 'Email',
  backToSignIn: 'Back to sign in',
}

type AuthForgotPasswordScreenProps = {
  loading?: boolean
  error?: string | null
  successMessage?: string | null
  onSubmit: (input: { email: string }) => void | Promise<void>
  onGoToLogin?: () => void
}

export function AuthForgotPasswordScreen({
  loading = false,
  error = null,
  successMessage = null,
  onSubmit,
  onGoToLogin,
}: AuthForgotPasswordScreenProps) {
  const [email, setEmail] = useState('')
  const [validation, setValidation] = useState<string | null>(null)

  const handleSubmit = async () => {
    const normalizedEmail = email.trim()
    if (!normalizedEmail.includes('@')) {
      setValidation('Please enter a valid email.')
      return
    }

    setValidation(null)
    await onSubmit({ email: normalizedEmail })
  }

  return (
    <PageScaffold variant='account' density='standard' scroll='auto'>
      <PageScaffold.Body>
        <Section>
          <Card variant='raised' style={{ gap: spacing.md }}>
            <Text variant='headline'>{authForgotCopy.title}</Text>
            <Text tone='muted'>{authForgotCopy.subtitle}</Text>

            <Input
              placeholder={authForgotCopy.emailPlaceholder}
              accessibilityLabel='Email address'
              keyboardType='email-address'
              autoCapitalize='none'
              value={email}
              onChangeText={setEmail}
              readOnly={loading}
            />

            {validation ? <Text tone='danger'>{validation}</Text> : null}
            {error ? <Text tone='danger'>{error}</Text> : null}
            {successMessage ? <Text tone='success'>{successMessage}</Text> : null}

            <Button onPress={() => void handleSubmit()} disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>

            <Box style={{ alignSelf: 'flex-start' }}>
              <Button size='sm' variant='ghost' onPress={onGoToLogin}>{authForgotCopy.backToSignIn}</Button>
            </Box>
          </Card>
        </Section>
      </PageScaffold.Body>
    </PageScaffold>
  )
}

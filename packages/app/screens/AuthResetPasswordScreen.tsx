import { useState } from 'react'
import { spacing } from '@real/tokens'
import { PageScaffold, Section } from '@real/ui'
import { Button, Card } from '@real/ui/components'
import { Box, Input, Text } from '@real/ui/primitives'

const authResetCopy = {
  title: 'Set New Password',
  subtitle: 'Enter your reset token and choose a new password.',
  resetTokenPlaceholder: 'Reset token',
  newPasswordPlaceholder: 'New password',
  backToSignIn: 'Back to sign in',
}

type AuthResetPasswordScreenProps = {
  defaultToken?: string
  loading?: boolean
  error?: string | null
  successMessage?: string | null
  onSubmit: (input: { token: string; newPassword: string }) => void | Promise<void>
  onGoToLogin?: () => void
}

export function AuthResetPasswordScreen({
  defaultToken = '',
  loading = false,
  error = null,
  successMessage = null,
  onSubmit,
  onGoToLogin,
}: AuthResetPasswordScreenProps) {
  const [token, setToken] = useState(defaultToken)
  const [newPassword, setNewPassword] = useState('')
  const [validation, setValidation] = useState<string | null>(null)

  const handleSubmit = async () => {
    const normalizedToken = token.trim()
    if (!normalizedToken) {
      setValidation('Reset token is required.')
      return
    }
    if (newPassword.length < 6) {
      setValidation('Password must be at least 6 characters.')
      return
    }

    setValidation(null)
    await onSubmit({ token: normalizedToken, newPassword })
  }

  return (
    <PageScaffold variant='account' density='standard' scroll='auto'>
      <PageScaffold.Body>
        <Section>
          <Card variant='raised' style={{ gap: spacing.md }}>
            <Text variant='headline'>{authResetCopy.title}</Text>
            <Text tone='muted'>{authResetCopy.subtitle}</Text>

            <Box style={{ gap: spacing.sm }}>
              <Input
                placeholder={authResetCopy.resetTokenPlaceholder}
                accessibilityLabel='Reset token'
                autoCapitalize='none'
                value={token}
                onChangeText={setToken}
                readOnly={loading}
              />
              <Input
                placeholder={authResetCopy.newPasswordPlaceholder}
                accessibilityLabel='New password'
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
                readOnly={loading}
              />
            </Box>

            {validation ? <Text tone='danger'>{validation}</Text> : null}
            {error ? <Text tone='danger'>{error}</Text> : null}
            {successMessage ? <Text tone='success'>{successMessage}</Text> : null}

            <Button onPress={() => void handleSubmit()} disabled={loading}>
              {loading ? 'Updating...' : 'Update Password'}
            </Button>

            <Box style={{ alignSelf: 'flex-start' }}>
              <Button size='sm' variant='ghost' onPress={onGoToLogin}>{authResetCopy.backToSignIn}</Button>
            </Box>
          </Card>
        </Section>
      </PageScaffold.Body>
    </PageScaffold>
  )
}

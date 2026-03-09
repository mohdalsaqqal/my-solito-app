import { useState } from 'react'
import { spacing } from '@real/tokens'
import { PageScaffold, Section } from '@real/ui'
import { Button, Card } from '@real/ui/components'
import { Box, Input, Text, Touchable } from '@real/ui/primitives'

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
            <Text variant='headline'>Set New Password</Text>
            <Text tone='muted'>Enter your reset token and choose a new password.</Text>

            <Box style={{ gap: spacing.sm }}>
              <Input
                placeholder='Reset token'
                autoCapitalize='none'
                value={token}
                onChangeText={setToken}
                readOnly={loading}
              />
              <Input
                placeholder='New password'
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

            <Touchable onPress={onGoToLogin}>
              <Text variant='caption' tone='primary'>Back to sign in</Text>
            </Touchable>
          </Card>
        </Section>
      </PageScaffold.Body>
    </PageScaffold>
  )
}

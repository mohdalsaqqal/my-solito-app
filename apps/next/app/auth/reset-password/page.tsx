'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AuthResetPasswordScreen } from '@real/app/screens/AuthResetPasswordScreen'
import { apiClient } from '../../apiClient'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tokenFromUrl = searchParams.get('token') ?? ''

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  return (
    <AuthResetPasswordScreen
      defaultToken={tokenFromUrl}
      loading={loading}
      error={error}
      successMessage={successMessage}
      onSubmit={async (input) => {
        setLoading(true)
        setError(null)
        setSuccessMessage(null)
        try {
          await apiClient.auth.resetPassword(input)
          setSuccessMessage('Password updated successfully. You can sign in now.')
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : 'Unable to reset password.')
        } finally {
          setLoading(false)
        }
      }}
      onGoToLogin={() => router.push('/auth/login')}
    />
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthForgotPasswordScreen } from '@real/app/screens/AuthForgotPasswordScreen'
import { apiClient } from '../../apiClient'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  return (
    <AuthForgotPasswordScreen
      loading={loading}
      error={error}
      successMessage={successMessage}
      onSubmit={async (input) => {
        setLoading(true)
        setError(null)
        setSuccessMessage(null)
        try {
          await apiClient.auth.requestReset(input)
          setSuccessMessage('If your account exists, a reset link has been sent.')
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : 'Unable to request password reset.')
        } finally {
          setLoading(false)
        }
      }}
      onGoToLogin={() => router.push('/auth/login')}
    />
  )
}

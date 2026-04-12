'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthLoginScreen } from '@real/app/screens/AuthLoginScreen'
import { apiClient } from '../../apiClient'

export function AuthLoginPageClient({ nextPath }: { nextPath: string | null }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  return (
    <AuthLoginScreen
      loading={loading}
      error={error}
      onSubmit={async (input) => {
        setLoading(true)
        setError(null)
        try {
          const session = await apiClient.auth.login(input)
          if (nextPath && nextPath.startsWith('/')) {
            router.push(nextPath)
            return
          }

          if (session.role === 'pharmacist') {
            router.push('/pharmacist')
            return
          }
          if (session.role === 'admin') {
            router.push('/admin')
            return
          }
          router.push('/account')
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : 'Unable to sign in.')
        } finally {
          setLoading(false)
        }
      }}
      onGoToRegister={() =>
        router.push(
          nextPath && nextPath.startsWith('/')
            ? `/auth/register?next=${encodeURIComponent(nextPath)}`
            : '/auth/register'
        )
      }
      onGoToForgotPassword={() => router.push('/auth/forgot-password')}
    />
  )
}

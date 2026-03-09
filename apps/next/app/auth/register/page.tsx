'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AuthRegisterScreen } from '@real/app/screens/AuthRegisterScreen'
import { apiClient } from '../../apiClient'

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextPath = searchParams.get('next')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  return (
    <AuthRegisterScreen
      loading={loading}
      error={error}
      onSubmit={async (input) => {
        setLoading(true)
        setError(null)
        try {
          await apiClient.auth.register(input)
          router.push(nextPath && nextPath.startsWith('/') ? nextPath : '/account')
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : 'Unable to create account.')
        } finally {
          setLoading(false)
        }
      }}
      onGoToLogin={() =>
        router.push(
          nextPath && nextPath.startsWith('/')
            ? `/auth/login?next=${encodeURIComponent(nextPath)}`
            : '/auth/login'
        )
      }
    />
  )
}

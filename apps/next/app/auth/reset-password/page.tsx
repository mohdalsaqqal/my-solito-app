import { Suspense } from 'react'
import { connection } from 'next/server'
import { AuthResetPasswordPageClient } from './ResetPasswordPageClient'

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  await connection()
  const params = await searchParams
  const defaultToken = params.token ?? ''
  return (
    <Suspense fallback={null}>
      <AuthResetPasswordPageClient defaultToken={defaultToken} />
    </Suspense>
  )
}

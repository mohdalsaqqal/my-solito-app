import { Suspense } from 'react'
import { connection } from 'next/server'
import { AuthLoginPageClient } from './LoginPageClient'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  await connection()
  const params = await searchParams
  const nextValue = params.next
  const nextPath = nextValue && nextValue.startsWith('/') ? nextValue : null
  return (
    <Suspense fallback={null}>
      <AuthLoginPageClient nextPath={nextPath} />
    </Suspense>
  )
}
